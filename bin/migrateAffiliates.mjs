import { Surreal } from 'surrealdb.js';
import env from 'rcompat/env';
import { config } from 'dotenv-flow';

config();

const {
    DB_USER: username,
    DB_PASS: password,
    DB_HOST: host,
    DB_NS: namespace,
    DB_DB: database,
    DB_PORT: port
} = env;

const db = new Surreal();

async function connectDB() {
    await db.connect(host + ':' + port + '/rpc', {
        namespace,
        database,
        auth: {
            namespace,
            database,
            username,
            password
        }
    });
}

(async () => {
    await connectDB();
    const affiliates = await getAffiliates();

    for (const affiliate of affiliates) {
        try {

            if (affiliate.referralCode) {
                const referralCodes = await getReferralCodesByAffiliateId(affiliate.id);
                if (!referralCodes || referralCodes.length == 0) {
                    const referrals = await getReferralsByCode(affiliate.referralCode);
                    await createReferralCode(affiliate.userId, affiliate.id, "Default", affiliate.referralCode, referrals.length, referrals.length, affiliate.commissions);
                    await db.query('UPDATE $id SET referralCode = NONE', { id: affiliate.id });
                }
            }

            if ((affiliate.commissions || affiliate.commissions == 0) && !affiliate.balance) {
                await db.query('UPDATE $id SET balance = $amount, commissions = NONE', { id: affiliate.id, amount: affiliate.commissions });
            }
        } catch (err) {
            console.error(err);
        }
    }

    await db.close();

})();

async function createReferralCode(userId, affiliateId, name, code, clicks = 0, conversions = 0, commissions = 0) {
    const referralCode = await db.create("referralCodes", { userId, affiliateId, name, code, clicks, conversions, commissions });
    return referralCode;
}

async function getReferralsByCode(code) {
    const query = 'SELECT * FROM referrals WHERE referralCode = $code';
    const referrals = await db.query(query, { code });
    return referrals.pop()
}


async function getReferralCodesByAffiliateId(id) {
    const query = 'SELECT * FROM referralCodes WHERE affiliateId = $id';
    const referralCodes = await db.query(query, { id });
    return referralCodes.pop()
}

async function getAffiliates() {
    const query = 'SELECT * FROM affiliates';
    const affiliates = await db.query(query);
    return affiliates.pop()
}