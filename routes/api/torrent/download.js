export default {
	async get(request) {
		const { store, query } = request;
		const {
			torrent: { Torrent }
		} = store;

		const magnet = query.get('magnet');
		const user = query.get('user');
		const pass = query.get('pass');

		return Torrent.start(url, user, pass);
	}
};
