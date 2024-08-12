import view from 'primate/handler/view';

export default {
	async get(request) {
		const { path, store } = request;
		const {
			files: { File }
		} = store;
		const id = path.get('id');
		const book = await File.getById(id);

		return view('Book.svelte', { book});
	}
};
