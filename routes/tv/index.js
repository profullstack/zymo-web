import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			files: { File }
		} = store;
		const { id } = session.get('user');
		const shows = await File.getAllByUserId(id, 'video', 'tv show');

		return view('TVShows.svelte', { shows });
	}
};
