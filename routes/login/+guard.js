import redirect from 'primate/handler/redirect';

export default (request) => {
	const {
		url: { pathname },
		query,
		session
	} = request;

	if (session.get('loggedIn')) {
		return redirect(query.get('next') || '/dashboard');
	} else if (session.get("unverifiedEmail")) {
		return redirect("/verify/email")
	}

	return true;
};
