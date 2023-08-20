import { view, redirect } from 'primate';

export default {
	async get(request) {
		const { session, path, store } = request;
        const { link: { Link} } = store;
        const alias = path.get('alias');
        const link = await Link.getByAlias(alias);
		console.log('alias link2:', link);

		return redirect(link.url);
	},
};
