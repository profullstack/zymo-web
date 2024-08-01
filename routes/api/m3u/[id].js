import { view, redirect } from 'primate';
const form = (params = {}) => view('apikeys/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, store, path } = request;
		const {
			m3u: { M3U }
		} = store;

		const id = path.get('id');
		return await M3U.fetchById(id);
	},
	async post(request) {
		const { session, store } = request;
		const {
			m3u: { Form, M3U }
		} = store;

		try {
			const data = request.body;

			await Form.validate(data);

			try {
				const m3u = await M3U.create(data);
				console.log('m3u:', m3u);
				return redirect('/dashboard');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
