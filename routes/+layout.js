import { view } from 'primate';

export default ({ session }) => {
	const isLoggedIn = Boolean(session.exists && session.get().token);

	return view('Layout.svelte', { hello: 'world', isLoggedIn });
};
