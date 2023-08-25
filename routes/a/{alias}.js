import { redirect } from 'primate';

export default {
	async get(request) {
		const { session, path, store, headers } = request;
		const {
			link: { Link },
			Track,
		} = store;
		const alias = path.get('alias');
		const link = await Link.getByAlias(alias);
		const { id } = link;
		
		await Track.visit(id, headers)

		console.log('alias link2:', link);
		const url = link.url.startsWith('http') ? link.url : `http://${link.url}`;

		return redirect(url);
	}
};
