import { view, redirect } from 'primate';
const form = (params = {}) => view('links/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			link: { Link }
		} = store;
		const alias = path.get('id');
		const link = await Link.getById(id);

		return redirect(link.url);
	}
};
