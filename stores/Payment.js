import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async create(data) {

            try {

                const now = new Date().toISOString();
                
                data.createdAt = now;
                data.updatedAt = now;

                const payments = await db.create("payments", data);

                return payments;

            } catch (e) {
                throw e;
                console.error(e)
            }
        },
        async update(id, data) {

            try {
                const payment = await db.merge(id, { ...data, updatedAt: new Date().toISOString() });
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
        async getByStripePaymentIntent(intent) {

            const query = `SELECT * FROM payments WHERE stripePaymentIntent = $intent`;

            try {

                const payments = await db.query(query, {
                    intent
                });

                return payments.pop().pop();
            } catch (e) {
                console.error(e)
                throw e;
            }
        },
        async getAllByUserId(id) {
            const query = `SELECT * FROM payments WHERE userId = $id ORDER BY updatedAt DESC`;

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
                const subscription = await this.getBySubscriptionId(data.stripeSubscriptionId)

                if (subscription && data.stripeSubscriptionId) {
                    await this.update(subscription.id, data)
                } else {
                    await this.create(data)
                }
            } catch (e) {
                console.error(e)
            }
        },
        async updatePaymentRefund(stripePaymentIntent, status) {
            try {
                const payment = await this.getByStripePaymentIntent(stripePaymentIntent);
                if(payment) {
                    let refunded = status == "succeeded";  
                    await this.update(payment.id, { refunded })
                }
            } catch (e) {
                console.error(e)
            }
        }
    }
}

export default {
    id: primary
};