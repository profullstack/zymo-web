import { redirect } from 'primate';

export default {
	async get(request) {
		const { session, path, store, headers } = request;
		const {
			link: { Link }
		} = store;
		const alias = path.get('alias');
		const link = await Link.getByAlias(alias);

		console.log('alias link2:', link);

		// await Link.visit(link, headers);
		const url = link.url.startsWith('http') ? link.url : `http://${link.url}`;

		return redirect(url);
	}
};
