import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async create(userId, referralCode) {

            try {
                const affiliate = await db.create("affiliates", { userId, referralCode, commissions: 0 });
                return affiliate;

            } catch (e) {
                throw e;
                console.error(e)
            }

        },
        async getByReferralCode(referralCode) {

            try {

                const query = `SELECT * FROM affiliates WHERE referralCode = $referralCode`;

                const affiliate = await db.query(query, {
                    referralCode
                });

                return affiliate.pop().pop();
            } catch (e) {
                console.error(e)
                throw e;
            }
        },
        async getByUserId(id) {
            try {

                const query = `SELECT * FROM affiliates WHERE userId = $id`;

                const affiliate = await db.query(query, {
                    id
                });

                return affiliate.pop().pop();
            } catch (e) {
                console.error(e)
                throw e;
            }
        },
        async addCommission(id, commission) {
            try {

                const query = `UPDATE $id SET commissions = $commission`;

                const affiliate = await db.query(query, {
                    id,
                    commission
                });

                return affiliate.pop().pop();


            } catch (e) {
                console.error(e)
                throw e;
            }
        },
        async generateReferralCode(length = 8) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let code = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                code += characters[randomIndex];
            }
            return code;
        }
    }
}

export default {
    id: primary
};