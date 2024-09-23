import view from 'primate/handler/view';

export default {
	async get() {
		const { env } = process;
		const { APP_DOMAIN } = env;
		const posts = await loadPosts();

		console.log(APP_DOMAIN);

		return view('Robots.hbs', {}, { partial: true });
	}
};
