import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, path } = request;
		const {
			m3u: { M3U }
		} = store;

		const id = path.get('id');
		return await M3U.fetchEPGById(id);
	},
};
