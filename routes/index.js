import { view } from 'primate';

export default {
	get() {
		const { env } = process;
    console.log(env, '<--- env');
		return view('Index.svelte', { APP_NAME: env.APP_NAME });
	}
};
