import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			files: { File }
		} = store;
		const { id } = session.get('user');
		const music = await File.getAllByUserId(id, 'music');

		return view('Music.svelte', { music });
	}
};
