import { view } from 'primate';

export default {
	async get(request) {
		const { store, session, query } = request;
		const {
			torrent: { Torrent }
		} = store;

		const q = query.get('q');
		const results = await Torrent.search(q);

		return view('torrents/Search.svelte', { results });
	}
};
