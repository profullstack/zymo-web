import { view, redirect } from 'primate';
// const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			apikeys: { Apikey }
		} = store;
		const id = path.get('id');
		const apikey = await Apikey.getById(id);
		console.log('id apikey:', apikey);

		return view('apikeys/Edit.svelte', { apikey, method: 'put' });
	},

	async put(request) {
		const { session, path, store } = request;
		const {
			apikeys: { Form, Apikey }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body.get();
			console.log('put:', data);

			await Form.validate(data);

			try {
				const apikey = await Apikey.update(id, data);
				console.log('apikey:', apikey);
				return { status: 'API key updated' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	},

	async delete(request) {
		const { session, path, store } = request;
		const {
			apikeys: { Form, Apikey }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await Apikey.delete(id);
				console.log('delete apikey:', res);
				return { status: 'API key deleted' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
