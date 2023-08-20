import env from 'runtime-compat/env';
import { primary } from '@primate/types';

export const actions = (db, store) => {
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
			let { url, alias } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const link = await db.create('links', {
					url,
					alias,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('link: ', link);
				return link;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getByAlias(alias) {
			console.log('alias:', alias);

			try {
				const link = await db.query('SELECT * FROM links WHERE alias = $alias', {
					alias
				});

				console.log('alias link:', link);
				return link;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getById(id) {
			console.log(id);

			try {
				const link = await db.query('SELECT * FROM links WHERE id = $id', {
					id
				});

				return link;
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
