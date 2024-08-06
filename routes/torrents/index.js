import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session } = request;
		const {
			torrent: { Torrent }
		} = store;

		const userId = session.get('user').id;
		const clients = await Torrent.getAllByUserId(userId);

		return view('Torrent.svelte', { clients });
	}
};
