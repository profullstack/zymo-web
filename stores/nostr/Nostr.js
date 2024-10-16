import env from '@rcompat/env';
import primary from '@primate/types/primary';
import { getMe } from '../../modules/user.js';

export const actions = ({ connection: db }) => {
	return {
		me: async () => {
			return await getMe(db);
		},

		async create(profile) {
			const { DB_NS, DB_DB } = env;
			console.log(DB_NS, DB_DB);

			console.log('profile:', profile);

			return await db.signup({
				namespace: DB_NS,
				database: DB_DB,
				access: 'allnostrusers',
				variables: {
					updatedAt: new Date().toISOString(),
					...profile
				}
			});
		},

		async login(profile) {
			const { DB_NS, DB_DB } = env;

			return await db.signin({
				namespace: DB_NS,
				database: DB_DB,
				access: 'allnostrusers',
				variables: {
					...profile
				}
			});
		}
	};
};

export default {
	id: primary
};
