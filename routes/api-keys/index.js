import { view, redirect } from 'primate';
const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	get(request) {
		const { session } = request;
		return form();
	},
	async post(request) {
		const { session, store } = request;
		const {
			link: { Form, Link }
		} = store;

		try {
			const data = request.body.get();

			await Form.validate(data);

			try {
				const link = await Link.create(data);
				console.log('link:', link);
				return redirect('/dashboard');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
