import env from 'rcompat/env';
import primary from '@primate/types/primary';
import FormData from 'form-data';
import Torrent from 'torrent-search-api-for-barbaroussa';
import spawn from '@rcompat/stdio/spawn';

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const [token] = await db.query('$token');
			const { ID: userId } = token;
			const [me] = await db.select(userId);

			delete me.password;
			console.log('me: ', me.email);
			return me;
		},
		async create(data) {
			console.log('create:', data);
			let { url, name, user, pass, provider, path } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const res = await db.create('torrent_client', {
					url,
					name,
					user,
					pass,
					provider,
					path,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('res: ', res);
				return res;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async getClientById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM torrent_client WHERE id = $id`;

			console.log(query);
			try {
				const [res] = await db.query(query, { id });

				console.log('id:', res);

				return res.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM torrent_client WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const [res] = await db.query(query, { createdBy });

				console.log('all:', res);

				return res;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async update(id, data) {
			console.log('update:', data);

			try {
				const res = await db.merge(id, {
					...data,
					updatedAt: new Date().toISOString()
				});

				console.log('updated: ', res);
				return res;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async delete(id) {
			console.log('delete:', id);

			try {
				const res = await db.delete(id);

				console.log('res: ', res);
				return res;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async addTorrent(client, torrentUrlOrMagnet, path) {
			let result;

			switch (client.provider) {
				case 'transmission':
					result = await this.addTorrentToTransmission(client, torrentUrlOrMagnet, path);
					break;
				case 'qbittorrent':
					result = await this.addTorrentToQbittorrent(client, torrentUrlOrMagnet);
					break;
				case 'deluge':
					result = await this.addTorrentToDeluge(client, torrentUrlOrMagnet);
					break;
				case 'rtorrent':
					result = await this.addTorrentToRtorrent(client, torrentUrlOrMagnet);
					break;
				default:
					console.error('Unsupported client');
			}

			return result;
		},

		async addTorrentToTransmission(client, torrentUrlOrMagnet, path = '/') {
			let response = await fetch(`${client.url}/transmission/rpc`, {
				headers:
					client.user && client.pass
						? {
								Authorization: 'Basic ' + btoa(`${client.user}:${client.pass}`)
							}
						: {}
			});

			let sessionId = response.headers.get('X-Transmission-Session-Id');
			const body = {
				method: 'torrent-add',
				arguments: { filename: torrentUrlOrMagnet, 'download-dir': path }
			};

			response = await fetch(`${client.url}/transmission/rpc`, {
				method: 'POST',
				headers: {
					'X-Transmission-Session-Id': sessionId,
					'Content-Type': 'application/json',
					...(client.user &&
						client.pass && {
							Authorization: 'Basic ' + btoa(`${client.user}:${client.pass}`)
						})
				},
				body: JSON.stringify(body)
			});

			if (response.ok) {
				const result = await response.json();
				console.log('Torrent added to Transmission:', result);

				return result;
			} else {
				console.error(
					'Error adding torrent to Transmission:',
					response.status,
					response.statusText
				);
			}
		},

		async addTorrentToQbittorrent(client, torrentUrlOrMagnet) {
			const form = new FormData();
			form.append('urls', torrentUrlOrMagnet);

			const response = await fetch(`${client.url}/api/v2/torrents/add`, {
				method: 'POST',
				headers:
					client.user && client.pass
						? {
								Authorization: 'Basic ' + btoa(`${client.user}:${client.pass}`)
							}
						: {},
				body: form
			});

			if (response.ok) {
				console.log('Torrent added to qBittorrent');
				return await response.json();
			} else {
				console.error(
					'Error adding torrent to qBittorrent:',
					response.status,
					response.statusText
				);
			}
		},

		async addTorrentToDeluge(client, torrentUrlOrMagnet) {
			const form = new FormData();
			form.append('file', torrentUrlOrMagnet);

			const response = await fetch(`${client.url}/json`, {
				method: 'POST',
				headers: {
					Authorization:
						client.user && client.pass
							? 'Basic ' + btoa(`${client.user}:${client.pass}`)
							: 'Basic ' + btoa('user:password') // Replace with dynamic if needed
				},
				body: form
			});

			if (response.ok) {
				console.log('Torrent added to Deluge');
				return await response.json();
			} else {
				console.error(
					'Error adding torrent to Deluge:',
					response.status,
					response.statusText
				);
			}
		},

		async addTorrentToRtorrent(client, torrentUrlOrMagnet) {
			const xmlData = `<?xml version="1.0"?>
    <methodCall>
        <methodName>load.start</methodName>
        <params>
            <param><value><string>${torrentUrlOrMagnet}</string></value></param>
        </params>
    </methodCall>`;

			const response = await fetch(`${client.url}/RPC2`, {
				method: 'POST',
				headers: {
					'Content-Type': 'text/xml',
					...(client.user &&
						client.pass && {
							Authorization: 'Basic ' + btoa(`${client.user}:${client.pass}`)
						})
				},
				body: xmlData
			});

			if (response.ok) {
				console.log('Torrent added to rTorrent');
				return await response.text();
			} else {
				console.error(
					'Error adding torrent to rTorrent:',
					response.status,
					response.statusText
				);
			}
		},

		async download(magnet, path = '') {
			console.log('download:', magnet, path);

			const me = await this.me();
			const { id: userId } = me;

			const [client] = (
				await db.query('SELECT * FROM torrent_client WHERE createdBy = $userId', { userId })
			).pop();

			console.log('client:', client);

			// set proper download path
			if (path.startsWith('/') || path.startsWith('./')) {
				path = client.path + path;
			} else if (path) {
				path = client.path + '/' + path;
			} else {
				path = client.path;
			}

			console.log('Download path:', path);
			return await this.addTorrent(client, magnet, path);
		},

		async processTorrentsInBatches(torrents, batchSize) {
			let index = 0;
			while (index < torrents.length) {
				const batch = torrents.slice(index, index + batchSize);
				await Promise.all(
					batch.map(async (torrent) => {
						try {
							const magnet = await Torrent.getMagnet(torrent);
							// console.log('magnet:', magnet);
							if (magnet) {
								torrent.magnet = magnet;
							}
						} catch (err) {
							console.error(err);
						}
					})
				);
				index += batchSize;
			}
		},
		async search(q, mediaType = '', sort = 'size') {
			let torrents = [];

			// Torrent.enablePublicProviders();
			for (let provider of [
				'1337x'
				// 'Torrent9'
				// 'Torrentz2',
				// 'KickassTorrents',
				// 'Rarbg'
				// 'Yts'
				// 'TorrentProject',
				// 'Limetorrents'
				// 'Eztv'
			]) {
				Torrent.enableProvider(provider);
			}

			try {
				torrents = await Torrent.search(q, mediaType, 200, sort);

				await this.processTorrentsInBatches(torrents, 50);
			} catch (err) {
				console.error(err);
			}

			return torrents.filter((t) => t.magnet);
		},
		async searchTorge(q, mediaType = '', sort = 'size') {
			let torrents = [];

			try {
				torrents = await spawn(`node ./bin/torge-all.sh "${q}" -s ${sort}`);

				console.log(stdout);

				// await this.processTorrentsInBatches(torrents, 50);
			} catch (err) {
				console.error(err);
			}

			return torrents;
		}
	};
};

export default {
	id: primary
};
