import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get(request) {
		const { store, session } = request;
		const { Affiliate, ReferralCode } = store;

		const userId = session.get('user').id;

		const affiliate = await Affiliate.getByUserId(userId);
		const referralCodes = await ReferralCode.getByUserId(userId);

		return view('affiliate/Dashboard.svelte', {
			affiliate,
			referralCodes,
		});
	},

	async post(request) {
		const { store, session } = request;
		const { Affiliate, ReferralCode } = store;
		const userId = session.get('user').id;

		const affiliate = await Affiliate.getByUserId(userId);

		if (!affiliate) {
			const affiliate = await Affiliate.create(userId);
			const code = await ReferralCode.generateCode();
			const referralCode = await ReferralCode.create(userId, affiliate.id, 'Default', code);
		}

		return redirect('/affiliate');
	}
};
