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
		async send(data) {
			// const { User } = store;

			console.log('send:', data);
			let { email } = data;
			const { DB_NS, DB_DB } = env;
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
	};
};

export default {
	id: primary
};
