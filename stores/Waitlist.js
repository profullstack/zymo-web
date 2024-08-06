import env from '@rcompat/env';
import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
    return {
        async add(email) {

            try {
                const subscribedEmail = await db.create("waitlist", { email });

                return subscribedEmail;

            } catch (e) {
                console.error(e)
                throw e;
            }

        },
        async getAll() {
			try {
                const query = `SELECT * FROM waitlist`;

                const waitlist = await db.query(query);

                return waitlist.pop();
            } catch (e) {
                console.error(e)
            }
		}
    }
}

export default {
    id: primary
};
