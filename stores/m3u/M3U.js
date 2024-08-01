import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const me = await db.info();
			delete me.password;
			console.log('me: ', me.email);
			return me;
		},
		async create(data) {
			// const { User } = store;

			console.log('create:', data);
			let { url, name } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const m3u = await db.create('m3u', {
					url,
					name,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('m3u: ', m3u);
				return m3u;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getByName(name) {
			console.log('name:', name);
			const query = `SELECT * FROM m3u WHERE name = $name`;

			console.log(query);

			try {
				const [m3u] = await db.query(query, {
					name
				});

				console.log('name m3u:', m3u);
				return m3u.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM m3u WHERE id = $id`;

			console.log(query);
			try {
				const [m3u] = await db.query(query, {
					id
				});

				console.log('id m3u:', m3u);

				return m3u.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async fetchById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM m3u WHERE id = $id`;
			const [m3u] = await db.query(query, {
				id
			});

			console.log('id m3u:', m3u);

			try {
				const res = await fetch(m3u.pop().url);

				if (res.ok) {
					return await res.text();
				}
			} catch (err) {
				console.error(err);
			}
		},
		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM m3u WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const [m3us] = await db.query(query, {
					createdBy
				});

				console.log('all m3u:', m3us);

				return m3us;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async update(id, data) {
			console.log('update:', data);

			try {
				const m3u = await db.merge(id, {
					...data,
					updatedAt: new Date().toISOString()
				});

				console.log('m3u updated: ', m3u);
				return m3u;
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
		}
	};
};

export default {
	id: primary
};
