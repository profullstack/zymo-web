import env from '@rcompat/env';
import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
    return {
        async getAllProducts() {

            try {

                const query = `SELECT * FROM products ORDER BY createdAt`;

                try {

                    const product = await db.query(query);

                    return product.pop();
                } catch (e) {
                    console.error(e)
                    throw e;
                }

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
