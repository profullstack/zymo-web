import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

const form = (params = {}) => view('login/Form.svelte', { ...params });

export default {
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
			} catch (err) {
				return { status: err.message };
			}

			if (me.verify.email.status !== 'verified') {
				await session.create({ token, user: me, loggedIn: false, unverifiedEmail: true });
				return redirect('/verify/email');
			}

			await session.create({ token, user: me, loggedIn: Boolean(token) });

			return redirect(next);
		} catch ({ errors }) {
			console.error(errors);
			return { errors };
		}
	}
};
