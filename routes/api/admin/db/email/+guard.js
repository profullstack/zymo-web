import redirect from 'primate/handler/redirect';

export default (request) => {
	const {
		url: { pathname },
		session
	} = request;

	if (session.get('loggedIn')) {
		const user = session.get('user');
		const { isAdmin } = user;

		if (isAdmin) {
			return true;
		} else {
			return redirect(`/login?next=${pathname}`);
		}
	}

	return redirect(`/login?next=${pathname}`);
};
