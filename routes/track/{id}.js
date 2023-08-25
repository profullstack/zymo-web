import { redirect } from 'primate';

export default {
	async post(request) {
		const { session, path, store, headers } = request;
		const {
			link: { Link }
		} = store;
		const id = path.get('id');
		const data = request.body.get();
		const link = await Link.getById(id);

		console.log('id track:', link);

		await Link.visit(link, headers, data);

		return {
			status: 'Ok'
		};
	}
};
