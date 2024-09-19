import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session, query } = request;
		const {
			xtream: { Xtream }
		} = store;

		const userId = session.get('user').id;
		const results = await Xtream.getAllByUserId(userId);
		const proxy = Boolean(parseInt(query.get('proxy')));
		console.log(proxy);

		return view('Xtream.svelte', { results, proxy });
	}
};
