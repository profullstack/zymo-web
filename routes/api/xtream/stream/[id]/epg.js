import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, path } = request;
		const {
			xtream: { Xtream }
		} = store;

		const id = path.get('id');
		return await Xtream.fetchEPGById(id);
	},
};
