import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const me = await db.info();

			console.log('me: ', me);

			return me;
		},
		async create(profile) {
			const { DB_NS, DB_DB } = env;
			console.log(DB_NS, DB_DB);

			console.log('profile:', profile);

			return await db.signup({
				namespace: DB_NS,
				database: DB_DB,
				scope: 'allnostrusers',
				updatedAt: new Date().toISOString(),
				...profile
			});
		},

		async login(profile) {
			const { DB_NS, DB_DB } = env;

			return await db.signin({
				namespace: DB_NS,
				database: DB_DB,
				scope: 'allnostrusers',
				...profile
			});
		}
	};
};

export default {
	id: primary
};
