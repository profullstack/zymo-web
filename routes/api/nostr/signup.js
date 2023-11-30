import { view } from 'primate';

export default {
	async post(request) {
		const { session, store, body } = request;
		const {
			nostr: { Nostr },
			User
		} = store;

		console.log('signup: ', body);
		return await Nostr.create(body);
	}
};
