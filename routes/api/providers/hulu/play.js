import HULU from '../../../../modules/providers/hulu.js';

const hulu = new HULU();

export default {
	async get(request) {
		const { store, query, session } = request;
		const {
			providers: { Hulu }
		} = store;
		const contentId = query.get('contentId');
		console.log('play:', contentId);

		const user = session.get('user');
		const { id: userId } = user;
		console.log('userId2:', userId);
		const provider = await Hulu.getByUserId(userId);
		const { username, password } = provider;
		await hulu.login(username, password);

		return await hulu.play(contentId);
	}
};
