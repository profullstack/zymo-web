export default {
	async post(request) {
		const { store, body } = request;
		const {
			torrent: { Torrent }
		} = store;

		console.log('post:', body);
		const { link: magnet, path } = body;
		const result = await Torrent.download(magnet, path);
		console.log(result);

		return { result };
	}
};
