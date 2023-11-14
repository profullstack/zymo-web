import { redirect } from 'primate';

export default (request) => {
	const {
		url: { pathname },
		query,
		session
	} = request;

	if (session.get().loggedIn) {
		return redirect(query.get('next') || '/dashboard');
	}

	return true;
};
