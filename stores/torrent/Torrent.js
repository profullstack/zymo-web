import env from 'rcompat/env';
import primary from '@primate/types/primary';
import FormData from 'form-data';
import Torrent from 'torrent-search-api-for-barbaroussa';

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const me = await db.info();
			delete me.password;
			console.log('me: ', me.email);
			return me;
		},
		async create(data) {
			console.log('create:', data);
			let { url, name, user, pass, provider } = data;
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

		async addTorrent(client, torrentUrlOrMagnet) {
			switch (client.provider) {
				case 'transmission':
					await this.addTorrentToTransmission(url, torrentUrlOrMagnet);
					break;
				case 'qbittorrent':
					await this.addTorrentToQbittorrent(url, torrentUrlOrMagnet);
					break;
				case 'deluge':
					await this.addTorrentToDeluge(url, torrentUrlOrMagnet);
					break;
				case 'rtorrent':
					await this.addTorrentToRtorrent(url, torrentUrlOrMagnet);
					break;
				default:
					console.error('Unsupported client');
			}
		},

		async addTorrentToTransmission(url, torrentUrlOrMagnet) {
			let response = await fetch(`${url}/transmission/rpc`);
			let sessionId = response.headers.get('X-Transmission-Session-Id');
			const body = {
				method: 'torrent-add',
				arguments: { filename: torrentUrlOrMagnet }
			};
			response = await fetch(`${url}/transmission/rpc`, {
				method: 'POST',
				headers: {
					'X-Transmission-Session-Id': sessionId,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});
			if (response.ok) {
				const result = await response.json();
				console.log('Torrent added to Transmission:', result);
			} else {
				console.error(
					'Error adding torrent to Transmission:',
					response.status,
					response.statusText
				);
			}
		},

		async addTorrentToQbittorrent(url, torrentUrlOrMagnet) {
			const form = new FormData();
			form.append('urls', torrentUrlOrMagnet);
			const response = await fetch(`${url}/api/v2/torrents/add`, {
				method: 'POST',
				body: form
			});
			if (response.ok) {
				console.log('Torrent added to qBittorrent');
			} else {
				console.error(
					'Error adding torrent to qBittorrent:',
					response.status,
					response.statusText
				);
			}
		},

		async addTorrentToDeluge(url, torrentUrlOrMagnet) {
			const form = new FormData();
			form.append('file', torrentUrlOrMagnet);
			const response = await fetch(`${url}/json`, {
				method: 'POST',
				headers: {
					Authorization: 'Basic ' + Buffer.from('user:password').toString('base64')
				},
				body: form
			});
			if (response.ok) {
				console.log('Torrent added to Deluge');
			} else {
				console.error(
					'Error adding torrent to Deluge:',
					response.status,
					response.statusText
				);
			}
		},

		async addTorrentToRtorrent(url, torrentUrlOrMagnet) {
			const xmlData = `<?xml version="1.0"?>
			<methodCall>
				<methodName>load.start</methodName>
				<params>
					<param><value><string>${torrentUrlOrMagnet}</string></value></param>
				</params>
			</methodCall>`;
			const response = await fetch(`${url}/RPC2`, {
				method: 'POST',
				body: xmlData,
				headers: { 'Content-Type': 'text/xml' }
			});
			if (response.ok) {
				console.log('Torrent added to rTorrent');
			} else {
				console.error(
					'Error adding torrent to rTorrent:',
					response.status,
					response.statusText
				);
			}
		},

		async search(q) {
			Torrent.enablePublicProviders();
			const torrents = await Torrent.search(q, 'Movies', 20);

			for (let torrent of torrents) {
				torrent.magnet = await Torrent.getMagnet(torrent);
			}

			console.log(torrents);

			return torrents;
		}
	};
};

export default {
	id: primary
};
