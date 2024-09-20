export default {
	async get(request) {
		const { path, store } = request;
		const {
			xtream: { Xtream }
		} = store;
		const id = path.get('id');
		const xtream = await Xtream.fetchById(id);
		console.log('id:', xtream);

		return xtream;
	}
};
