import { view, redirect } from 'primate';
// const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			library: { Library }
		} = store;
		const id = path.get('id');
		const library = await Library.getById(id);
		console.log('id:', library);

		return view('library/Edit.svelte', { library, method: 'put' });
	},

	async put(request) {
		const { session, path, store } = request;
		const {
			library: { Form, Library }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body;
			console.log('put:', data);

			await Form.validate(data);

			try {
				const result = await Library.update(id, data);
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
			library: { Library }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await Library.delete(id);
				console.log('delete:', res);
				return { status: 'Deleted libray and its files' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
