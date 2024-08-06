import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session } = request;
		const { Affiliate, Payout } = store;

		const userId = session.get('user').id;

		const affiliate = await Affiliate.getByUserId(userId);
		const payouts = await Payout.getAllByUserId(userId);

		return view('affiliate/payouts/Index.svelte', {
			affiliate,
			payouts
		});
	}
};
