export default {
	async get(request) {
		const { store, query } = request;
		const {
			Search
		} = store;

		const q = query.get('q');		
		let types = query.get('types');
		
		types = types ? types.split(',') : ['podcasts', 'music', 'livestreams'];
		
		const results = await Search.search(q, types);

		console.log('results:', results);

		return { q, results };
	}
};
