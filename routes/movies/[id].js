import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session, path, store, query } = request;
		const {
			files: { File }
		} = store;
		const id = path.get('id');
		const proxy = Boolean(parseInt(query.get('proxy')));
		console.log(proxy);
		const movie = await File.getById(id);

		return view('Movie.svelte', { movie, proxy });
	}
};
