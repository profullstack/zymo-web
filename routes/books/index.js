import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session, store } = request;
		const {
			files: { File }
		} = store;
		const { id } = session.get('user');

		const books = await File.getAllByUserId(id, 'book');

		return view('Books.svelte', { books });
	}
};
