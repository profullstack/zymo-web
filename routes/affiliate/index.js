import { view, Response, Status, redirect } from "primate";
import env from 'rcompat/env';
const { APP_DOMAIN } = env;

export default {

    async get(request) {
        const { store, session } = request;
        const { Affiliate, Referral } = store;

        const userId = session.get("user").id;

        const affiliate = await Affiliate.getByUserId(userId);
        let referrals;

        if (affiliate) {
            referrals = await Referral.getReferralsByCode(affiliate.referralCode);
        }

        return view('AffiliateDashboard.svelte', {
            affiliate,
            referrals,
            APP_DOMAIN
        });
    },

    async post(request) {

        const { store, session } = request;
        const { Affiliate } = store;
        const userId = session.get("user").id;

        const affiliate = await Affiliate.getByUserId(userId);

        if (!affiliate) {
            const referralCode = await Affiliate.generateReferralCode();
            const affiliate = await Affiliate.create(userId, referralCode);
        }

        return redirect("/affiliate");
    }

}