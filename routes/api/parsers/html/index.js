export default {
	async get(request) {
		const { store, query } = request;
		const {
			parsers: { HTML }
		} = store;

		const id = query.get('id');

		return await HTML.startCrawler(id);
	}
};
