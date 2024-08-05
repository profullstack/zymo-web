import { redirect } from 'primate';

export default (request) => {
	const {
		url: { pathname, search },
		query,
		session
	} = request;

	if (session.get('loggedIn')) {
		return redirect(query.get('next') || '/dashboard');
	} else if (session.get('unverifiedEmail')) {
		return redirect('/verify/email');
	}

	return true;
};
