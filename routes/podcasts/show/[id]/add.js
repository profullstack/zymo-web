import view from 'primate/handler/view';

export default {
	async post(request) {
		const { path, store, body } = request;
		const {
			podcast: { Podcast }
		} = store;
		const id = path.get('id');
		const podcast = await Podcast.geById(id);
		const res = await Podcast.addShow(podcast, body.url);
		console.log('id:', res);

		return view('podcasts/Edit.svelte', { podcast: res, method: 'put' });
	}
};
