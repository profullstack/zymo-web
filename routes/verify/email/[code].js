import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get(request) {
		const { path, store, session } = request;
		const { User } = store;
		const code = path.get('code');

		const user = await User.getByEmailVerificationCode(code);

		if (user) {
			if (user.verify.email.status == 'verified') {
				return view('verify/email/Status.svelte', {
					error: 'Your email address is already verified'
				});
			}

			if (user.verify.email.expiration < new Date().toISOString()) {
				return view('verify/email/Status.svelte', {
					error: 'Verification link is expired, please sign in to request a new one'
				});
			}

			await User.verifyEmail(user.id);
			await request.session.destroy();

			return view('verify/email/Status.svelte', {
				message:
					'Your email address has been verified successfully, please log in to continue'
			});
		}

		return view('verify/email/Status.svelte', { error: 'Invalid email verification link' });
	}
};
