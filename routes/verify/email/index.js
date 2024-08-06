import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session } = request;
		const user = session.get("user");
		return view('verify/email/Index.svelte', { email: user.email });
	}
};
