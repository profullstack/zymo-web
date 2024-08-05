import redirect from 'primate/handler/redirect';

export default (request) => {
	const {
		url: { pathname },
		query,
		session
	} = request;

	if (pathname.startsWith("/verify/email/")) {
		return true;
	}

	const user = session.get('user');
	if (!user) {
		return redirect('/login');
	}

	try {
		if (user.verify.email.status == "verified") {
			return redirect('/dashboard');
		}
	} catch (e) { }

	return true;
};
