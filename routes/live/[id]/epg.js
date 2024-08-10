import view from 'primate/handler/view';
// const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	async get(request) {
		const { path, store } = request;
		const {
			m3u: { M3U }
		} = store;
		// const id = path.get('id');
		// const m3u = await M3U.getById(id);
		// console.log('id m3u:', m3u);

		return view('m3u/EPG.svelte', {});
	}
};
