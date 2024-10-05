import env from 'rcompat/env';
import primary from '@primate/types/primary';
import FormData from 'form-data';
import spawn from '@rcompat/stdio/spawn';

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const [auth] = await db.query('SELECT * FROM $auth');
			console.log('auth:', auth);
			const { id: userId } = auth.pop();
			const [me] = await db.select(userId);

			delete me?.password;
			console.log('me: ', me);
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

		async follow(magnet, path = '') {
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

		async search(q) {
			let results = [];

			try {
				const command = './bin/podsearch';
				const args = `"${q}"`;
				const fullCommand = `${command} ${args}`;

				console.log(fullCommand);
				const { stdout } = spawn(fullCommand);

				return new Response(stdout, { headers: { 'context-type': 'application/json' } });
			} catch (err) {
				console.error(err);
				return new Response(err);
			}
		}
	};
};

export default {
	id: primary
};
