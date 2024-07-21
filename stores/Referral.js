import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async create(referralCode, userId) {

            try {
                const referral = await db.create("referrals", { referralCode, userId });
                return referral;

            } catch (e) {
                throw e;
                console.error(e)
            }

        },
        async getReferralsByCode(code) {

            try {

                const query = `SELECT * FROM referrals WHERE referralCode = $code`;

                const referrals = await db.query(query, {
                    code
                });

                return referrals.pop();
            } catch (e) {
                console.error(e)
                throw e;
            }
        },
        async getReferralByUserId(id) {

            try {

                const query = `SELECT * FROM referrals WHERE userId = $id`;

                const referral = await db.query(query, {
                    id
                });

                return referral.pop().pop();
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