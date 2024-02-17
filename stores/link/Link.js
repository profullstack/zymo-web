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
		async create(data, token) {
			// const { User } = store;

			console.log('create:', data);
			console.log('token foobar:', token);
			let { url, alias } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB, me.id, url, alias);

			try {
				// await db.authenticate(token);
				const body = {
					url,
					alias,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				console.log('body:', body);
				const link = await db.create('links', body);

				console.log('link foobar: ', link);
				return link;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getByAlias(alias) {
			console.log('alias:', alias);
			const query = `SELECT * FROM links WHERE alias = $alias`;

			console.log(query);

			try {
				const link = await db.query(query, {
					alias
				});

				console.log('alias link:', link);
				return link.pop().pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM links WHERE id = $id`;

			console.log(query);
			try {
				const link = await db.query(query, {
					id
				});

				console.log('id link:', link);

				return link.pop().pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM links WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const links = await db.query(query, {
					createdBy
				});

				console.log('all links:', links);

				return links.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async update(id, data) {
			console.log('update:', data);
			let { url, alias } = data;

			try {
				const link = await db.merge(id, {
					url,
					alias,
					updatedAt: new Date().toISOString()
				});

				console.log('link: ', link);
				return link;
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
