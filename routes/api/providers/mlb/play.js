import MLBTV from '../../../../modules/providers/mlb.js';

const mlbTv = new MLBTV();

export default {
	async get(request) {
		const { store, query, session } = request;
		const {
			providers: { MLB }
		} = store;
		const contentId = query.get('contentId');
		console.log('play:', contentId);

		const user = session.get('user');
		const { id: userId } = user;
		console.log('userId2:', userId);
		const provider = await MLB.getByUserId(userId);
		const { username, password } = provider;
		await mlbTv.login(username, password);

		return mlbTv.streamSelect(contentId);
	}
};
