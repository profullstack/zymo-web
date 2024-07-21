import { view } from 'primate';

export default {
	async get() {
		const { env } = process;
		const { APP_NAME, EMAIL, PHONE } = env;

		return view('Terms.svelte', { APP_NAME, EMAIL, PHONE });
	}
};
