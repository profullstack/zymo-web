import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

const form = (params = {}) => view('login/Form.svelte', { ...params });

export default {
	get(request) {
		const { query } = request;
		const next = query.get('next') || '/dashboard';

		return form({ next });
	},
	async post(request) {
		const { session, store, body } = request;
		const next = body.next || '/dashboard';
		const {
			login: { Form },
			User
		} = store;

		try {
			const user = request.body;

			await Form.validate(user);

			let token;
			let me;

			try {
				token = await User.signin(user);
				me = await User.me();
				console.log('token/me:', token, me);
			} catch (err) {
				console.error(err);
				return form({ status: err.message });
			}

			if (me.verify.email.status !== 'verified') {
				await session.create({ token, user: me, loggedIn: false, unverifiedEmail: true });
				return redirect('/verify/email');
			}

			console.log('logging in:', token, me);

			await session.create({ token, user: me, loggedIn: Boolean(token) });

			console.log('redirect:', next);
			return redirect(next);
		} catch ({ errors }) {
			console.error(errors);
			return form({ errors });
		}
	}
};
