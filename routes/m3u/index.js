import { view } from 'primate';

export default {
	async get(request) {
		const { store, session } = request;
		const {
			m3u: { Form, M3U }
		} = store;

		const userId = session.get('user').id;
		const m3us = await M3U.getAllByUserId(userId);

		return view('M3U.svelte', { m3us });
	}
};
