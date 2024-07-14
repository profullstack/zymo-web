import { view } from 'primate';

export default {
	async get(request) {
		const { session } = request;
		const user = session.get("user");
		return view('verify/email/Index.svelte', { email: user.email });
	}
};
