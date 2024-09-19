import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';
const form = (params = {}) => view('xtream/Form.svelte', { ...params });

export default {
	get() {
		return form();
	},
	async post(request) {
		const { session, store } = request;
		const {
			xtream: { Form, Xtream }
		} = store;

		console.log('foo2:', session.get('user'), 'token2:', session.get('token'));
		try {
			const data = request.body;

			await Form.validate(data);

			try {
				const result = await Xtream.create(data, session.get('token'));
				console.log('xtream:', result);
				return redirect('/dashboard');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
