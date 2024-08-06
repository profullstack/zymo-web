import view from 'primate/handler/view';

export default {
	async post(request) {
		const { session, store, body } = request;
		const {
			nostr: { Nostr },
			User
		} = store;

		console.log('signup: ', body);
		let token;

		try {
			token = await Nostr.create(body);
		} catch (err) {
			token = await Nostr.login(body);
		}

		const me = await Nostr.me();
		await session.create({ token, user: me, loggedIn: Boolean(token) });
		return token;
	}
};
