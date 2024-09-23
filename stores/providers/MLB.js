import primary from '@primate/types/primary';

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
			// const { User } = store;

			console.log('create:', data);
			let { username, password } = data;
			const { DB_NS, DB_DB } = process.env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const provider = await db.create('stream_providers', {
					username,
					password,
					provider: 'mlb',
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('provider: ', provider);
				return provider;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async getByUserId(userId) {
			console.log('mlb userId:', userId);
			const query = `SELECT * FROM stream_providers WHERE createdBy = $userId AND provider = 'mlb'`;

			console.log(query);
			try {
				const [provider] = await db.query(query, {
					userId
				});

				console.log('id provider:', provider);

				return provider.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async getById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM stream_providers WHERE id = $id`;

			console.log(query);
			try {
				const [provider] = await db.query(query, {
					id
				});

				console.log('id provider:', provider);

				return provider.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async getAll() {
			const me = await this.me();
			const { id: userId } = me;

			const query = `SELECT * FROM stream_providers WHERE createdBy = $userId AND provider = 'mlb'`;
			try {
				const [providers] = await db.query(query, { userId });

				return providers;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async update(id, data) {
			console.log('update:', data);

			try {
				const provider = await db.merge(id, {
					...data,
					updatedAt: new Date().toISOString()
				});

				console.log('provider updated: ', provider);
				return provider;
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
