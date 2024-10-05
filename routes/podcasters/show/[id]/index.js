import view from 'primate/handler/view';

export default {
	async get(request) {
		const { path, store } = request;
		const {
			torrent: { Torrent }
		} = store;
		const id = path.get('id');
		const client = await Torrent.getClientById(id);
		console.log('id:', client);

		return view('podcasters/Edit.svelte', { client, method: 'put' });
	},

	async put(request) {
		const { path, store } = request;
		const {
			torrent: { Form, Torrent }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body;
			console.log('put:', data);

			await Form.validate(data);

			try {
				const result = await Torrent.update(id, data);
				console.log('updated:', result);
				return { status: 'Updated' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	},

	async delete(request) {
		const { path, store } = request;
		const {
			torrent: { Torrent }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await Torrent.delete(id);
				console.log('delete:', res);
				return { status: 'Deleted' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
