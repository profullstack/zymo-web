import redirect from 'primate/handler/redirect';
import json from 'primate/handler/json';

// const form = (params = {}) => view('login/Form.svelte', { ...params });

export default {
	async post(request) {
		const { session, store, body } = request;
		const next = body.next || '/dashboard';
		const {
			User
		} = store;

		try {
			const user = request.body;

			// await Form.validate(user);

			let token;
			let me;

			try {
				token = await User.signin(user);
				me = await User.me(user.email);
			} catch (err) {
				return json({status: err.message }, { status: 401, headers: { 'Content-Type': 'application/json' }});
			}

			if (me.verify.email.status !== 'verified') {
				await session.create({ token, user: me, loggedIn: false, unverifiedEmail: true });
				return redirect('/verify/email');
			}

			await session.create({ token, user: me, loggedIn: Boolean(token) });

			return redirect(next);
		} catch ({ errors }) {
			return json({ errors }, { status: 500, headers: { 'Content-Type': 'application/json' }});
		}
	}
};
