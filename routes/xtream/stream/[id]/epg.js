import view from 'primate/handler/view';
// const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	async get(request) {
		const { path, store } = request;
		const {
			xtream: { Xtream }
		} = store;
		const id = path.get('id');
		const xtream = await Xtream.getById(id);
		console.log('id:',xtream);

		return view('xtream/EPG.svelte', { xtream });
	}
};
