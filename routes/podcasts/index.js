import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session } = request;
		const {
			podcast: { Podcast }
		} = store;

		const userId = session.get('user').id;
		const podcasts = await Podcast.getAllByUserId(userId);

		return view('Podcasts.svelte', { podcasts });
	}
};
