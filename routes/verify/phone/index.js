import view from 'primate/handler/view';

export default {
	async get(request) {
		const { session, store } = request;
		const { User } = store;
		const user = session.get("user");

		const verification = await User.getPhoneVerificationCode(user.id);

		const verified = verification.verify.phone.status == "verified";

		return view('verify/phone/Index.svelte', { verified, phonePrefix: user.phonePrefix, phone: user.phone });
	},
	async post(request) {
		const { body, store, session } = request;
		const { User } = store;
		const code = body.code;

		if (!code) {
			return view("verify/phone/Index.svelte", { error: "No code provided" });
		}

		const user = session.get("user");

		const verification = await User.getPhoneVerificationCode(user.id);
		const verified = verification.verify.phone.status == "verified";

		const details = { verified, phonePrefix: user.phonePrefix, phone: user.phone }

		if (verification.verify.phone.status == "verified") {
			return view("verify/phone/Index.svelte", { error: "Your phone number has already been verified", ...details });
		}

		if (verification.verify.phone.expiration < new Date().toISOString()) {
			return view("verify/phone/Index.svelte", { error: "Verification code is expired, please request a new one", ...details });
		}

		if (verification.verify.phone.code == code) {
			await User.verifyPhone(user.id);
			return view("verify/phone/Index.svelte", { message: "Your phone number has been verified successfully", ...details });
		}


		return view("verify/phone/Index.svelte", { error: "An unknown error occured", ...details });
	}

};
