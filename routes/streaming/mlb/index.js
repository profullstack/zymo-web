import view from 'primate/handler/view';
import MLBTV from '../../../modules/providers/mlb.js';

const mlbTv = new MLBTV();

export default {
	async get(request) {
		const { store, session } = request;
		const userId = session.get('id');

		const {
			providers: { MLB }
		} = store;

		const provider = MLB.getByUserId(userId);
		const { username, password } = provider;
		await mlbTv.login(username, password); //todo lookup username/password from 'stream_providers'
		const games = await mlbTv.getTodaysGames();
		const providers = await MLB.getAll();
		return view('streaming/mlb/MLB.svelte', { games, providers });
	}
};
