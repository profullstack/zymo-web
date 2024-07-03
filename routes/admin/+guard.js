import { redirect } from 'primate';

export default (request) => {
	const {
		url: { pathname },
		session
	} = request;
	const user = session.get('user');
	const { isAdmin } = user;

	if (isAdmin) {
		return true;
	}

	return redirect(`/login?next=${pathname}`);
};
