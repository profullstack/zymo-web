import { view, redirect } from 'primate';

const form = (params = {}) => view('register/Form.svelte', { ...params });
const home = '/dashboard';

export default {
	async get(request) {
		const { session, store } = request;

		if (session.exists) {
			// already logged in, redirect to dashboard
			return redirect(home);
		}

		const { Countries } = store;
		const countries = await Countries.get();

		// show form
		return form({ countries });
	},
	async post(request) {
		const { session, store } = request;

		const {
			register: { Form },
			User
		} = store;
		try {
			const user = request.body.get();
			console.log('post user:', user);

			// validate
			await Form.validate(user);
			let token, me;

			try {
				token = await User.create(user);
				me = await User.me();
			} catch (err) {
				return form({ status: err.message });
			}

			console.log('token/me:', token, me);

			await session.create({ token, user: me });

			try {
				await User.generateEmailVerifyCode(me.id);

				if (me.phone && me.phonePrefix) {
					await User.generatePhoneVerifyCode(me.id);
				}
			} catch (err) {
				console.error(err);
			}

			// todo: add a way to flash something to the user, can use a hash for now
			// for example: /dashboard#flash=Some message
			return redirect('/dashboard');
		} catch ({ errors }) {
			console.error(errors);
			return form({ errors });
		}
	}
};
