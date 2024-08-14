import env from '@rcompat/env';
import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
	return {
		async add(email) {
			try {
				const createdAt = new Date();
				const subscribedEmail = await db.create('waitlist', { email, createdAt });

				return subscribedEmail;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async getAll() {
			try {
				const query = `SELECT * FROM waitlist ORDER BY createdAt DESC`;

				const waitlist = await db.query(query);

				return waitlist.pop();
			} catch (e) {
				console.error(e);
			}
		}
	};
};

export default {
	id: primary
};
