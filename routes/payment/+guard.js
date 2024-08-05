import { redirect } from 'primate';

export default (request) => {
	const {
		url: { pathname, search }
	} = request;

	const allow = ['/payment/stripe/webhook'];

	if (allow.includes(pathname)) {
		return true;
	}

	const { session } = request;

	if (session.get('loggedIn')) {
		return true;
	}

	return redirect(`/login?next=${encodeURIComponent(pathname + search)}`);
};
