import { redirect, view } from 'primate';

export default {
	async get(request) {
		const { path } = request;


		return view("Referral.svelte");
	}
};
