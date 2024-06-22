import { Response, Status, redirect, view } from 'primate';

export default {
    async get(request) {
        const { path, store, session } = request;
        const { Affiliate, ReferralCode } = store;

        const userId = session.get("user").id;

        const code = path.get("code");

        const referralCode = await ReferralCode.getByCode(code);

        if (!referralCode || referralCode.userId !== userId) {
            redirect("/affiliate")
        }

        return view("affiliate/code/Rename.svelte", { name: referralCode.name });
    },

    async post(request) {
        const { path, store, session, body } = request;
        const { Affiliate, ReferralCode } = store;
        const userId = session.get("user").id;

        const code = path.get("code");

        const referralCode = await ReferralCode.getByCode(code);

        if (!body.name) {
            return view("affiliate/code/Rename.svelte", { error: "No name provided" });
        }

        if (referralCode && referralCode.userId == userId) {
            try {
                await ReferralCode.updateName(body.name, code);
            } catch (err) {
                console.error(err)
            }
        }

        return redirect("/affiliate");
    },

};
