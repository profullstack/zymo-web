import view from "primate/handler/view";

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			link: { Link },
			apikeys: { Apikey },
			User,
		} = store;

		const user = session.get('user');
		const userId = user.id;
		const links = await Link.getAllByUserId(userId);
		const apikeys = await Apikey.getAllByUserId(userId)

		var phoneUnverified = false;

		if (user.phone) {
			try {
				const verification = await User.getPhoneVerificationCode(userId);
				phoneUnverified = verification.verify?.phone.status !== "verified";

			} catch (e) { }
		}

		console.log('links2:', links, apikeys);

		return view("Dashboard.svelte", { links, apikeys, phoneUnverified });
	},
};
