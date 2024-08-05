import { INTERNAL_SERVER_ERROR } from '@rcompat/http/status';
const { FROM_EMAIL } = process.env;

export default {
	async post(request) {
		const { body, session, store } = request;
		const {
			User,
			external: { Mailgun }
		} = store;
		const user = session.get('user');
		const email = user.email;

		const dbUser = await User.getById(user.id);

		if (dbUser.verify.email.status !== 'verified') {
			const result = await User.generateEmailVerifyCode(user.id);
			const code = result.verify.email.code;

			if (code) {
				const response = await Mailgun.sendVerifyEmail({ to: email, code });
				return response;
			}
		}

		return error('Error', { status: INTERNAL_SERVER_ERROR });
	}
};
