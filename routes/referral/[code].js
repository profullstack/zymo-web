import { Response, Status } from 'primate';

export default {
	async get(request) {
		const { path } = request;

		const referralCode = path.get("code")
		const futureDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 2);

		const response = new Response(null, {
			status: Status.FOUND,
			headers: {
				"Set-Cookie": `referralCode=${referralCode}; expires=${futureDate.toUTCString()}; path=/; SameSite=Strict`,
				"Location": "/register"
			}
		});

		return response;
	}
};
