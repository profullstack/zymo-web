import { view } from 'primate';

export default {
	async post(request) {
		const { session, store, body } = request;
		const {
			nostr: { Nostr },
			User
		} = store;

		return await Nostr.login(body);
	}
};
