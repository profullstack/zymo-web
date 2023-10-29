import { redirect } from 'primate';

export default (request) => {
	const {
		url: { pathname },
		session,
		store
	} = request;
	const { User } = store;

	console.log(request, '<--- request');

	console.log('loggedIn:', session.get().loggedIn);

	if (session.get().loggedIn || User.tryApiLogin(request)) {
		return true;
	}

	return redirect(`/login?next=${pathname}`);
};
