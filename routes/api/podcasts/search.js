export default {
	async get(request) {
		const { store, query } = request;
		const {
			podcast: { Podcast }
		} = store;

		const q = query.get('q') || 'joe rogan';
		const results = await Podcast.search(q);

		return results;
	}
};
