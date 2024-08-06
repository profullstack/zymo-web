import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session } = request;
		const { Affiliate, User } = store;

		const userId = session.get('user').id;

		let affiliates = await Affiliate.getAll();

		affiliates = await Promise.all(
			affiliates.map(async (affiliate) => {
				const userInfo = await User.getById(affiliate.userId);
				return { ...affiliate, userInfo };
			})
		);

		return view('admin/affiliates/Index.svelte', {
			affiliates
		});
	}
};
