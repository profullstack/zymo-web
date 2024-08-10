import view from 'primate/handler/view';

export default {
	async get(request) {
		const { path, store, query } = request;
		const {
			files: { File }
		} = store;
		const id = path.get('id');
		const proxy = Boolean(parseInt(query.get('proxy')));
		console.log(proxy);
		const show = await File.getById(id);

		return view('TV.svelte', { show, proxy });
	}
};
