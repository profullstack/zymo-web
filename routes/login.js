import {view, redirect} from "primate";

const form = (params = {}) => view('login/Form.svelte', { ...params });

export default {
	get(request) {
		const { session, query } = request;
		const next = query.get('next') || '/dashboard';

		console.log(session.exists);
		if (session.exists) {
			return redirect(next);
		}

		return form({ next });
	},
	async post(request) {
		const { session, store, body } = request;
		const next = body.get('next') || '/dashboard';
		const {
			login: { Form },
			User
		} = store;

		try {
			const user = request.body.get();

			await Form.validate(user);

      let token;
			let me;

			try {
				token = await User.signin(user);
				me = await User.me();
			} catch (err) {
				return form({ status: err.message });
			}

			await session.create({ token, user: me, loggedIn: Boolean(token) });

			return redirect(next);
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
