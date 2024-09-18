export default {
	async post(request) {
		const { store, body } = request;
		const {
			podcast: { Podcast }
		} = store;

		console.log('post:', body);
		const { url, name } = body;
		const result = await Podcast.follow(url, name);
		console.log(result);

		return { result };
	}
};
