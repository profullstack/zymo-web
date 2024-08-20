import view from 'primate/handler/view';
import MLBTV from '../../../modules/providers/mlb.js';

const mlbTv = new MLBTV();

export default {
	async get(request) {
		const { store, session } = request;
		const user = session.get('user');
		const { id: userId } = user;

		const {
			providers: { MLB }
		} = store;

		const provider = await MLB.getByUserId(userId);
		const { username, password } = provider;
		await mlbTv.login(username, password);
		const games = await mlbTv.getTodaysGames();
		const providers = await MLB.getAll();
		return view('streaming/mlb/MLB.svelte', { games, providers });
	}
};
