export default {
	async get(request) {
		const { store, query } = request;
		const {
			xtream: { Xtream }
		} = store;

		const id = query.get('id');

		return Xtream.getById(id);
	},
};
