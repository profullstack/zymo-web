import view from "primate/handler/view";

export default {
	async get(request) {
		const { session, store } = request;
		const {
			apikeys: { Apikey },
			User,
			m3u: { M3U },
			library: { Library },
			torrent: { Torrent }
		} = store;

		const user = session.get('user');
		const userId = user.id;
		const m3us = await M3U.getAllByUserId(userId);
		const apikeys = await Apikey.getAllByUserId(userId);
		const libraries = await Library.getAllByUserId(userId);
		const clients = await Torrent.getAllByUserId(userId);

		console.log('dashboard:', m3us, apikeys, libraries, clients);
		var phoneUnverified = false;

		if (user.phone) {
			try {
				const verification = await User.getPhoneVerificationCode(userId);
				phoneUnverified = verification.verify?.phone.status !== 'verified';
			} catch (e) {}
		}
		return view('Dashboard.svelte', { m3us, apikeys, libraries, clients, phoneUnverified });
	}
};
