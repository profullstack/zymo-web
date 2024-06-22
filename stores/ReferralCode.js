import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async create(userId, affiliateId, name, code, clicks = 0, conversions = 0,  commissions = 0) {

            try {
                const referralCode = await db.create("referralCodes", { userId, affiliateId, name, code, clicks, conversions, commissions});
                return referralCode;

            } catch (e) {
                console.error(e)
            }

        },
        async getByCode(code) {

            try {

                const query = `SELECT * FROM referralCodes WHERE code = $code`;

                const referralCode = await db.query(query, {
                    code
                });

                return referralCode.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async getByUserId(id) {
            try {

                const query = `SELECT * FROM referralCodes WHERE userId = $id`;

                const referralCodes = await db.query(query, {
                    id
                });

                return referralCodes.pop();
            } catch (e) {
                console.error(e)
            }
        },
        async getByAffiliateId(id) {
            try {

                const query = `SELECT * FROM referralCodes WHERE affiliateId = $id`;

                const referralCodes = await db.query(query, {
                    id
                });

                return referralCodes.pop();
            } catch (e) {
                console.error(e)
            }
        },
        async updateName(name, code) {
            try {

                const query = `UPDATE referralCodes SET name = $name WHERE code = $code`;

                const referralCode = await db.query(query, {
                    name,
                    code
                });

                return referralCode.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async updateClicks(code) {
            try {

                const query = `UPDATE referralCodes SET clicks += 1 WHERE code = $code`;

                const referralCode = await db.query(query, {
                    code
                });

                return referralCode.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async updateConversions(code) {
            try {

                const query = `UPDATE referralCodes SET conversions += 1 WHERE code = $code`;

                const referralCode = await db.query(query, {
                    code
                });

                return referralCode.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async updateCommissions(code, amount) {
            try {

                const query = `UPDATE referralCodes SET commissions += $amount WHERE code = $code`;

                const referralCode = await db.query(query, {
                    amount,
                    code
                });

                return referralCode.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async deleteCode(code) {
            try {

                const query = `DELETE referralCodes WHERE code = $code`;

                const referralCode = await db.query(query, {
                    code
                });

                return referralCode.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async generateCode(length = 8) {
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