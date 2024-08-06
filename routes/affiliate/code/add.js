import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get() {
		return view('affiliate/code/Add.svelte');
	},
	async post(request) {
		const { store, session, body } = request;
		const { Affiliate, ReferralCode } = store;
		const userId = session.get('user').id;

		const affiliate = await Affiliate.getByUserId(userId);

		if (!body.name) {
			return view('affiliate/code/Add.svelte', { error: 'No name provided' });
		}

		if (affiliate) {
			const code = await ReferralCode.generateCode();
			const referralCode = await ReferralCode.create(userId, affiliate.id, body.name, code);
		}

		return redirect('/affiliate');
	}
};
