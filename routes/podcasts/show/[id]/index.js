import view from 'primate/handler/view';

export default {
	async get(request) {
		const { path, store } = request;
		const {
			podcast: { Podcast }
		} = store;
		const id = path.get('id');
		const item = await Podcast.getById(id);
		console.log('id:', item);

		return view('podcasts/Edit.svelte', { podcast: item, method: 'put' });
	},

	async put(request) {
		const { path, store } = request;
		const {
			podcast: { Form, Podcast }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body;
			console.log('put:', data);

			await Form.validate(data);

			try {
				const result = await Podcast.update(id, data);
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
			podcast: { Podcast }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await Podcast.delete(id);
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
