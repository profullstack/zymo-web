import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async getAllProducts() {

            try {

                return await db.select('products');

            } catch (e) {
                console.error(e)
                throw e;
            }

        },

        async getByStripeProductId(id) {
            const query = `SELECT * FROM products WHERE stripeProductId = $id`;

            try {

                const product = await db.query(query, {
                    id
                });

                return product.pop().pop();
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