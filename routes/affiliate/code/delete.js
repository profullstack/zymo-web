import Status from "@rcompat/http/Status";

export default {
	async post(request) {
		const { store, session, body } = request;
		const { Affiliate, ReferralCode } = store;
		const userId = session.get('user').id;

		const referralCode = await ReferralCode.getByCode(body.code);

		if (referralCode && referralCode.userId == userId) {
			try {
				await ReferralCode.deleteCode(body.code);
			} catch (err) {
				console.error(err);
			}
		}

		return new Response(Status.OK);
	}
};
