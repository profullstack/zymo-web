import view from 'primate/handler/view';
import MLBTV from '../../../modules/providers/mlb.js';

const mlbTv = new MLBTV();

export default {
	async get(request) {
		const { store } = request;

		const {
			providers: { MLB }
		} = store;

		await mlbTv.login(); //todo lookup username/password from 'stream_providers'
		const games = await mlbTv.getTodaysGames();
		const providers = await MLB.getAll();
		return view('streaming/mlb/MLB.svelte', { games, providers });
	}
};
