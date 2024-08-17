import view from 'primate/handler/view';
import MLBTV from '../../../modules/providers/mlb.js';

const mlbTv = new MLBTV();

export default {
	async get(request) {
		const { store, session, query } = request;
		const {
			m3u: { M3U }
		} = store;

		const result = await mlbTv.login();
		const games = await mlbTv.getTodaysGames();
		return view('streaming/MLB.svelte', { games });
	}
};
