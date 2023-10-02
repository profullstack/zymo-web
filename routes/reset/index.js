import { view, redirect } from 'primate';

const form = (params = {}) => view('reset/Form.svelte', { ...params });

export default {
	get(request) {
		const { session, query } = request;
		return form();
	},
	async post(request) {
		const { session, store, body } = request;
		const next = body.get('next') || '/dashboard';
		const {
			reset: { Form, Reset },
			User
		} = store;

		try {
			const user = request.body.get();

			await Form.validate(user);

			let token;
			let me;

			try {
                const mail = {

                };
				token = await Reset.send(mail);
				me = await User.me();
			} catch (err) {
				return form({ status: err.message });
			}

			return redirect('/');
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
