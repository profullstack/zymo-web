export default {
	async get(request) {
		const { session, store, path } = request;
		const {
			xtream: { Xtream }
		} = store;

		const id = path.get('id');
		return await Xtream.getById(id);
	}
};
