import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			files: { File }
		} = store;
		const { id } = session.get('user');
		// todo: after fetching metadata, filter by mediaType (ie: book, movie, music)
		const movies = await File.getAllByUserId(id);

		return view('Movies.svelte', { movies });
	}
};
