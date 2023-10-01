import { view, redirect } from 'primate';
const form = (params = {}) => view('apikeys/Form.svelte', { ...params });

export default {
	get(request) {
		const { session } = request;
		return form();
	},
	async post(request) {
		const { session, store } = request;
		const {
			apikeys: { Form, Apikey }
		} = store;

		try {
			const data = request.body.get();

			await Form.validate(data);

			try {
				const apikey = await Apikey.create(data);
				console.log('apikey:', apikey);
				return redirect('/dashboard');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
