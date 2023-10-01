import env from 'runtime-compat/env';
import { primary } from '@primate/types';

export const actions = ({connection: db}) => {
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
			let { name } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const apikey = await db.create('apikeys', {
					name,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('apikey: ', apikey);
				return apikey;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getByName(name) {
			console.log('name:', name);
			const query = `SELECT * FROM apikeys WHERE name = $name`;

			console.log(query);

			try {
				const apikey = await db.query(query, {
					name
				});

				console.log('name apikey:', apikey);
				return apikey[0].result[0];
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM apikeys WHERE id = $id`;

			console.log(query);
			try {
				const apikey = await db.query(query, {
					id
				});

				console.log('id apikey:', apikey);

				return apikey[0].result[0];
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM apikeys WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const apikeys = await db.query(query, {
					createdBy
				});

				console.log('all apikeys:', apikeys);

				return apikeys[0].result;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async update(id, data) {
			console.log('update:', data);
			let { name } = data;

			try {
				const apikey = await db.merge(id, {
					name,
					updatedAt: new Date().toISOString()
				});

				console.log('apikey: ', apikey);
				return apikey;
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
