import { view, redirect } from 'primate';

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			link: { Link }
		} = store;
		const id = path.get('id');
		const link = await Link.getById(id);

		console.log('link id:', link);

		return redirect(link.url);
	}
};
