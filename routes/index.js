import { view } from 'primate';

export default {
	get() {
		const { env } = process;
		
		return view('Index.svelte', { APP_NAME: env.APP_NAME });
	}
};
