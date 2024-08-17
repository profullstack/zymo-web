import MLBTV from '../../../../modules/providers/mlb.js';

const mlbTv = new MLBTV();

export default {
	async get(request) {
		const { store, query } = request;
		const contentId = query.get('contentId');

		console.log('play:', contentId);

		await mlbTv.login();

		return mlbTv.streamSelect(contentId);
	}
};
