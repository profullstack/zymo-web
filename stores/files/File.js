import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
	return {
		async getById(id) {
			try {
				const query = `SELECT * FROM media_files WHERE id = $id`;

				try {
					const [res] = await db.query(query, { id });

					return res.pop();
				} catch (e) {
					console.error(e);
					throw e;
				}
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM media_files WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const results = await db.query(query, {
					createdBy
				});

				console.log('all:', results);

				return results.pop();
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
