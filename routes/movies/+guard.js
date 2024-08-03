import { redirect } from 'primate';

export default async (request) => {
	const {
		url: { pathname },
		session,
		store
	} = request;
	const { User } = store;

	console.log('loggedIn:', session.get('loggedIn'));

	if (session.get('loggedIn') || (await User.tryApiLogin(request))) {
		return true;
	}

	return redirect(`/login?next=${pathname}`);
};
