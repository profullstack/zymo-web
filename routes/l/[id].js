import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get(request) {
		const { session, path, store, headers } = request;
		const {
			link: { Link },
			Track
		} = store;
		const id = path.get('id');
		const link = await Link.getById(id);

		await Track.visit(id, headers);
		console.log('id link2:', link);

		return redirect(link.url);
	}
};
