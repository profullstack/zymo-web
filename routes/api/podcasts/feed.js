export default {
	async post(request) {
		const { store, body } = request;
		const {
			podcast: { Podcast }
		} = store;

		console.log('podcast:', body);
		const { url } = body;
		const result = await Podcast.fetchFeed(url);
		console.log(JSON.stringify(result));

		return result;
	}
};
