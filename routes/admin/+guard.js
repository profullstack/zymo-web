import { redirect } from 'primate';

export default (request) => {
	const {
		url: { pathname, search },
		session
	} = request;

	if (session.get('loggedIn')) {
		const user = session.get('user');
		const { isAdmin } = user;

		if (isAdmin) {
			return true;
		} else {
			return redirect(`/`);
		}
	}

	return redirect(`/login?next=${encodeURIComponent(pathname + search)}`);
};
