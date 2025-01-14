import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session } = request;
		const { Affiliate, User } = store;

		const userId = session.get('user').id;

        //get user object from User store
		let user = await User.getById(userId);

		return view('settings/Settings.svelte', {
			user
		});
	}
};
