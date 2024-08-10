import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';
const form = (params = {}) => view('m3u/Form.svelte', { ...params });

export default {
	get() {
		return form();
	},
	async post(request) {
		const { session, store } = request;
		const {
			m3u: { Form, M3U }
		} = store;

		console.log('foo2:', session.get('user'), 'token2:', session.get('token'));
		try {
			const data = request.body;

			await Form.validate(data);

			try {
				const m3u = await M3U.create(data, session.get('token'));
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
