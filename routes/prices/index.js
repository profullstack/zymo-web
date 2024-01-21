import { view } from 'primate';

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			prices: { GPU }
		} = store;

		const results = await GPU.search(request.body);

		console.log(JSON.stringify(results, null, 2));
		return view('prices/Index.svelte', { results });
	}
};
