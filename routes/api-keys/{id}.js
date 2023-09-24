import { view, redirect } from 'primate';
// const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			link: { Link }
		} = store;
		const id = path.get('id');
		const link = await Link.getById(id);
		console.log('id link2:', link);

		return view('links/Edit.svelte', { link, method: 'put' });
	},

	async put(request) {
		const { session, path, store } = request;
		const {
			link: { Form, Link }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body.get();
			console.log('put:', data);

			await Form.validate(data);

			try {
				const link = await Link.update(id, data);
				console.log('link:', link);
				return { status: 'Link updated' };
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
			link: { Form, Link }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await Link.delete(id);
				console.log('delete link:', res);
				return { status: 'Link deleted' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
