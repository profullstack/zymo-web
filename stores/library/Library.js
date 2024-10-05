import env from 'rcompat/env';
import primary from '@primate/types/primary';
import { getMe } from '../../modules/user.js';

export const actions = ({ connection: db }) => {
	return {
		me: async () => {
			return await getMe(db);
		},
		async create(data) {
			// const { User } = store;

			console.log('create:', data);
			let { url, name, user, pass } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const library = await db.create('library', {
					url,
					name,
					user,
					pass,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('created library: ', library);
				return library;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async getById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM library WHERE id = $id`;

			console.log(query);
			try {
				const [library] = await db.query(query, {
					id
				});

				console.log('id library:', library);

				return library.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async crawlById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM library WHERE id = $id`;
			const [library] = await db.query(query, {
				id
			});

			console.log('id library:', library);

			try {
				// todo: crawl library url
			} catch (err) {
				console.error(err);
			}
		},
		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM library WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const [libraries] = await db.query(query, {
					createdBy
				});

				console.log('all:', libraries);

				return libraries;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async update(id, data) {
			console.log('update:', data);

			try {
				await db.update(id, {
					...data,
					updatedAt: new Date().toISOString()
				});

				const [library] = await db.select(id);

				console.log(' updated: ', library);
				return library;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async delete(id) {
			console.log('delete:', id);

			try {
				const res = await db.delete(id);
				const res2 = await db.query(`DELETE FROM media_files WHERE libraryId = $id`, {
					id
				});
				console.log('deleted library files:', res2);

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
