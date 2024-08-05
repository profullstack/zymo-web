import { FOUND } from '@rcompat/http/status';

export default {
	async get(request) {
		const { path, store } = request;
		const { Affiliate, ReferralCode } = store;

		const referralCode = path.get('code');
		await ReferralCode.updateClicks(referralCode);

		const futureDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 2);

		const response = new Response(null, {
			status: FOUND,
			headers: {
				'Set-Cookie': `referralCode=${referralCode}; expires=${futureDate.toUTCString()}; path=/; SameSite=Strict`,
				Location: '/'
			}
		});

		return response;
	}
};
