import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session, query } = request;
		const {
			m3u: { M3U }
		} = store;

		return view('Streaming.svelte');
	}
};
