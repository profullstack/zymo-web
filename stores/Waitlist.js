import env from 'rcompat/env';
import { primary } from '@primate/types';

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
    }
}

export default {
    id: primary
};