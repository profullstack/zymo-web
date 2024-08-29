import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

const form = (params = {}) => view('register/Form.svelte', { ...params });
const home = '/maps';

export default {
	async get(request) {
		const { session, store } = request;

		if (session.exists() && session.get('loggedIn')) {
			// already logged in, redirect to dashboard
			return redirect(home);
		}

		const { Countries } = store;
		const countries = await Countries.get();

		// show form
		return form({ countries });
	},
	async post(request) {
		const { session, store, cookies, headers } = request;

		const {
			register: { Form },
			external: { Mailgun, Twilio },
			User,
			Referral,
			ReferralCode
		} = store;
		try {
			const user = request.body;
			console.log('post user:', user);

			// validate
			await Form.validate(user);
			let token, me;
			const reqHeaders = headers.json();
			console.log(reqHeaders, '<< reqHeaders');

			user.headers = reqHeaders;

			try {
				token = await User.create(user);
				me = await User.me();
			} catch (err) {
				return form({ status: err.message });
			}

			console.log('token/me:', token, me);

			await session.create({ token, user: me, loggedIn: false, unverifiedEmail: true });

			try {
				const evcResult = await User.generateEmailVerifyCode(me.id);
				const evCode = evcResult.verify.email.code;

				if (evCode) {
					await Mailgun.sendVerifyEmail({ to: me.email, code: evCode });
				}
				if (me.phone && me.phonePrefix) {
					const pvcResult = await User.generatePhoneVerifyCode(me.id);
					const pvCode = pvcResult.verify.phone.code;

					const phone = me.phonePrefix + me.phone;

					if (pvCode) {
						await Twilio.sendPhoneVerificationCode({ to: phone, code: pvCode });
					}
				}
			} catch (err) {
				console.error(err);
			}

			try {
				const referralCode = cookies.get('referralCode');
				if (referralCode) {
					const referral = await Referral.create(referralCode, me.id);
					await ReferralCode.updateConversions(referralCode);
				}
			} catch (err) {
				console.error(err);
			}

			// todo: add a way to flash something to the user, can use a hash for now
			// for example: /dashboard#flash=Some message
			return redirect('/verify/email');
		} catch ({ errors }) {
			console.error(errors);
			return form({ errors });
		}
	}
};
