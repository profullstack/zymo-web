import { view } from 'primate';

export default {
	async get(request) {
		const { store, session, query } = request;
		const {
			m3u: { M3U }
		} = store;

		const userId = session.get('user').id;
		const m3us = await M3U.getAllByUserId(userId);
		const proxy = Boolean(parseInt(query.get('proxy')));
		console.log(proxy);

		return view('M3U.svelte', { m3us, proxy });
	}
};
