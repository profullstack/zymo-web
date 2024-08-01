import { view, redirect } from 'primate';
// const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			m3u: { M3U }
		} = store;
		const id = path.get('id');
		const m3u = await M3U.getById(id);
		console.log('id m3u:', m3u);

		return view('m3u/Edit.svelte', { m3u, method: 'put' });
	},

	async put(request) {
		const { session, path, store } = request;
		const {
			m3u: { Form, M3U }
		} = store;

		const id = path.get('id');

		try {
			const data = request.body;
			console.log('put:', data);

			await Form.validate(data);

			try {
				const m3u = await M3U.update(id, data);
				console.log('m3u updated:', m3u);
				return { status: 'M3U updated' };
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
			m3u: { Form, M3U }
		} = store;

		const id = path.get('id');

		try {
			console.log('delete:', id);

			try {
				const res = await M3U.delete(id);
				console.log('delete m3u:', res);
				return { status: 'M3U deleted' };
			} catch (err) {
				return { status: err.message };
			}
		} catch ({ errors }) {
			return { errors };
		}
	}
};
