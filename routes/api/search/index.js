export default {
	async get(request) {
		const { store, query } = request;
		const {
			Search
		} = store;

		const q = query.get('q');
		const results = await Search.search(q);

		return results;
	}
};
