import { view } from 'primate';

export default {
	async post(request) {
		const { path, store, body } = request;
		const {
			torrent: { Torrent }
		} = store;
		const id = path.get('id');
		const client = await Torrent.getClientById(id);
		const res = await Torrent.addTorrent(client, body.url);
		console.log('id:', res);

		return view('torrents/Edit.svelte', { client: res, method: 'put' });
	}
};
