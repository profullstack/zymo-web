import { view } from 'primate';

export default {
	get() {
		const { env } = process;
		const { APP_NAME } = env;

		return view('Index.svelte', { APP_NAME });
	}
};
