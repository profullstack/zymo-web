import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			xtream: { Xtream }
		} = store;
		const id = path.get('id');
		const xtream = await Xtream.getById(id);
		console.log('id:', xtream);

		return view('xtream/Edit.svelte', { xtream, method: 'put' });
	},

	async put(request) {
		const { path, store } = request;
		const {
			xtream: { Form, Xtream }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body;
			console.log('put:', data);

			await Form.validate(data);

			try {
				await Xtream.update(id, data);
				return { status: 'Xtream code updated' };
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
			xtream: { Xtream }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await Xtream.delete(id);
				console.log('delete:', res);
				return { status: 'Xtream code deleted' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
