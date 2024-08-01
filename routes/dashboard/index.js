import { view } from 'primate';

export default {
	async get(request) {
		const { session, store } = request;
		const {
			apikeys: { Apikey },
			User,
			m3u: { M3U }
		} = store;

		const user = session.get('user');
		const userId = user.id;
		const m3us = await M3U.getAllByUserId(userId);
		const apikeys = await Apikey.getAllByUserId(userId);

		console.log('m3us:', m3us, apikeys);
		var phoneUnverified = false;

		if (user.phone) {
			try {
				const verification = await User.getPhoneVerificationCode(userId);
				phoneUnverified = verification.verify?.phone.status !== 'verified';
			} catch (e) {}
		}
		return view('Dashboard.svelte', { m3us, apikeys, phoneUnverified });
	}
};
