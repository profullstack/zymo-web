import redirect from 'primate/handler/redirect';

export default async (request) => {
	const {
		url: { pathname, search },
		session,
		store
	} = request;
	const { User } = store;

	console.log('loggedIn:', session.get('loggedIn'));

	if (session.get('loggedIn') || (await User.tryApiLogin(request))) {
		return true;
	}

	return { status: 'No access' };
};
