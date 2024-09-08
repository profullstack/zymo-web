import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, query } = request;
		const {
			torrent: { Torrent }
		} = store;

		const q = query.get('q') || '1080';
		const mediaType = query.get('mediaType') || '';
		const sort = query.get('sort') || 'seeds';
		const results = await Torrent.searchTorge(q, mediaType, sort);

		return results;
	}
};
