import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async create(method, status, details, userId) {

            try {
                
                const now = new Date().toISOString();

                const payout = await db.create("payouts", { method, status, details, userId, createdAt: now, updatedAt: now  });
                return payout.pop();

            } catch (e) {
                console.error(e)
            }

        },
        async getAllByUserId(id) {
            try {

                const query = `SELECT * FROM payouts WHERE userId = $id ORDER BY updatedAt DESC`;

                const payouts = await db.query(query, {
                    id
                });

                return payouts.pop();
            } catch (e) {
                console.error(e)
            }
        }
    }
}

export default {
    id: primary
};