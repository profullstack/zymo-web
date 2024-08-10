import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, query } = request;
		const {
			torrent: { Torrent }
		} = store;

		const q = query.get('q') || '1080';
		const mediaType = query.get('mediaType') || '';
		const results = await Torrent.search(q, mediaType);

		return results;
	}
};
