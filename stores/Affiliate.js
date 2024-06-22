import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async create(userId) {

            try {
                const affiliate = await db.create("affiliates", { userId });
                return affiliate.pop();

            } catch (e) {
                console.error(e)
            }

        },
        async updateBalance(id, amount) {
            try {

                const query = `UPDATE $id SET balance += $amount`;

                const affiliate = await db.query(query, {
                    id,
                    amount
                });

                return affiliate.pop().pop();
            } catch (e) {
                console.error(e)
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
            }
        }
    }
}

export default {
    id: primary
};