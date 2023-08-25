import { view, redirect } from 'primate';

export default {
	async get(request) {
		const { session, path, store, headers } = request;
		const {
			link: { Link }
		} = store;
		const id = path.get('id');
		const link = await Link.getById(id);

		// await Link.visit(link, headers);
		console.log('id link2:', link);

		return redirect(link.url);
	}
};
