import { view } from 'primate';

export default ({ session }) => {
	const user = session.get('user');
	let isAdmin = false;

	if (user && user.isAdmin) {
		isAdmin = true;
	}

	const isLoggedIn = Boolean(session.exists() && session.get('loggedIn'));
	const unverifiedUser = Boolean(session.exists() && session.get('unverifiedEmail'));

	return view('Layout.svelte', { hello: 'world', isLoggedIn, unverifiedUser, isAdmin });
};
