import view from 'primate/handler/view';
const form = (params = {}) => view('streaming/mlb/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			providers: { MLB }
		} = store;
		const id = path.get('id');
		const mlb = await MLB.getById(id);
		console.log('id provider:', mlb);

		return view('streaming/mlb/account/Edit.svelte', { mlb, method: 'put' });
	},

	async put(request) {
		const { path, store } = request;
		const {
			providers: { MLB, Form }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body;
			console.log('put:', data);

			await Form.validate(data);

			try {
				const provider = await MLB.update(id, data);
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
			providers: { MLB }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await MLB.delete(id);
				console.log('delete mlb:', res);
				return { status: 'MLB deleted' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
