import view from 'primate/handler/view';
const form = (params = {}) => view('streaming/mlb/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			providers: { Hulu }
		} = store;
		const id = path.get('id');
		const hulu = await Hulu.getById(id);
		console.log('id provider:', hulu);

		return view('streaming/hulu/account/Edit.svelte', { hulu, method: 'put' });
	},

	async put(request) {
		const { path, store } = request;
		const {
			providers: { Hulu, Form }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body;
			console.log('put:', data);

			await Form.validate(data);

			try {
				const provider = await Hulu.update(id, data);
				console.log('provider updated:', provider);
				return { status: 'Provider updated' };
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
			providers: { Hulu }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await Hulu.delete(id);
				console.log('delete hulu:', res);
				return { status: 'Hulu deleted' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
