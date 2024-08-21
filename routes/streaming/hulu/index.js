import view from 'primate/handler/view';
import HULU from '../../../modules/providers/hulu.js';

const hulu = new HULU();

export default {
	async get(request) {
		const { store, session } = request;
		const user = session.get('user');
		const { id: userId } = user;

		const {
			providers: { Hulu }
		} = store;

		// const provider = await Hulu.getByUserId(userId);
		// const { username, password } = provider;
		// await hulu.login(username, password);
		// const shows = await hulu.getTodaysGames();
		const providers = await Hulu.getAll();
		return view('streaming/hulu/Hulu.svelte', { providers });
	}
};
