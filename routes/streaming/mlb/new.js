import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';
const form = (params = {}) => view('streaming/mlb/Form.svelte', { ...params });

export default {
	get() {
		return form();
	},
	async post(request) {
		const { store } = request;
		const {
			providers: { Form, MLB }
		} = store;

		try {
			const data = request.body;

			await Form.validate(data);

			try {
				const provider = await MLB.create(data);
				console.log('provider:', provider);
				return redirect('/streaming/mlb');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
