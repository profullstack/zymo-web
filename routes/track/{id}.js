import { redirect } from 'primate';

export default {
	async post(request) {
		const { path, store, headers } = request;
		const { Track } = store;
		const id = path.get('id');
		const data = request.body.get();

		console.log('id track:', id);
		await Track.visit(id, headers, data);

		return {
			status: 'Ok'
		};
	}
};
