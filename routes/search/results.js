import view from 'primate/handler/view';

export default {
	async get(request) {
		const { query } = request;
		const q = query.get('q');
		return view('SearchResults.svelte', { q });
	}
};
