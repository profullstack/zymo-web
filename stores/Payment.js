import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async create(data) {

            let { userId, status, subscriptionInterval, stripeSubscriptionId, productId, renewalDate, cancelAtPeriodEnd } = data;

            try {
                const body = {
                    userId,
                    status,
                    subscriptionInterval,
                    stripeSubscriptionId,
                    productId,
                    renewalDate,
                    cancelAtPeriodEnd
                }

                const payments = await db.create("payments", body);

                return payments;

            } catch (e) {
                throw e;
                console.error(e)
            }
        },
        async update(id, data) {

            try {
                const payment = await db.merge(id, data);
                return payment;

            } catch (e) {
                console.error(e);
                throw e;
            }
        },
        async getBySubscriptionId(id) {

            const query = `SELECT * FROM payments WHERE stripeSubscriptionId = $id`;

            try {

                const payments = await db.query(query, {
                    id
                });

                return payments.pop().pop();
            } catch (e) {
                console.error(e)
                throw e;
            }
        },
        async getAllByUserId(id) {
            const query = `SELECT * FROM payments WHERE userId = $id`;

            try {

                const payments = await db.query(query, {
                    id
                });

                return payments.pop();
            } catch (e) {
                console.error(e)
                throw e;
            }
        },

        async updateOrCreate(data) {
            try {
                const payment = await this.getBySubscriptionId(data.stripeSubscriptionId)

                if (payment && data.stripeSubscriptionId) {
                    await this.update(payment.id, data)
                } else {
                    await this.create(data)
                }
            } catch (e) {
                console.error(e)
                throw e;
            }
        }
    }
}

export default {
    id: primary
};