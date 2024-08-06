import env from '@rcompat/env';
import primary from '@primate/types/primary';

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
        async payout(id, amount) {
            try {

                const query = `UPDATE $id SET balance -= $amount`;

                const affiliate = await db.query(query, {
                    id,
                    amount
                });

                return affiliate.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async getById(id) {
            try {

                const query = `SELECT * FROM affiliates WHERE id = $id`;

                const affiliate = await db.query(query, {
                    id
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
        },
        async getAll() {
            try {

                const query = `SELECT * FROM affiliates`;

                const affiliates = await db.query(query);

                return affiliates.pop();
            } catch (e) {
                console.error(e)
            }
        },
        async addPayoutMethod(userId, payoutMethod) {
            try {
                const query = `
                    UPDATE affiliates SET payoutMethods += $payoutMethod WHERE userId = $userId
                `;

                const affiliate = await db.query(query, {
                    userId,
                    payoutMethod
                });

                return affiliate.pop().pop();
            } catch (e) {
                console.error(e);
            }

        },
        async updatePayoutMethod(userId, payoutMethod) {
            try {
                const affiliateData = await this.getByUserId(userId);

                const payoutMethodIndex = affiliateData.payoutMethods.findIndex(method => method.id === payoutMethod.id);

                const query = `
                            UPDATE affiliates
                            SET payoutMethods[$index] = $payoutMethod
                            WHERE userId = $userId
                        `;

                const affiliate = await db.query(query, {
                    userId,
                    payoutMethod,
                    index: payoutMethodIndex,
                });

                return affiliate.pop().pop();
            } catch (e) {
                console.error(e);
            }
        },
        async deletePayoutMethod(userId, payoutMethod) {
            try {
                const query = `
                    UPDATE affiliates SET payoutMethods -= $payoutMethod WHERE userId = $userId
                `;

                const affiliate = await db.query(query, {
                    userId,
                    payoutMethod
                });

                return affiliate.pop().pop();
            } catch (e) {
                console.error(e);
            }
        },
        createPayoutMethodId(length = 15) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let id = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                id += characters[randomIndex];
            }
            return id;
        }

    }
}

export default {
    id: primary
};
