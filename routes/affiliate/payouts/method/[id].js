import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get(request) {
		const { path, store, session } = request;
		const { Affiliate } = store;

		const userId = session.get('user').id;
		const id = path.get('id');

		const affiliate = await Affiliate.getByUserId(userId);

		if (!affiliate) {
			redirect('/affiliate');
		}

		const payoutMethod = affiliate.payoutMethods.find((method) => method.id == id);

		if (!payoutMethod) {
			redirect('/affiliate');
		}

		return view('affiliate/payouts/method/Edit.svelte', { payoutMethod });
	},

	async post(request) {
		const { store, session, body, path } = request;
		const { Affiliate, Payout } = store;

		const userId = session.get('user').id;
		const id = path.get('id');

		const affiliate = await Affiliate.getByUserId(userId);

		if (!affiliate) {
			redirect('/affiliate');
		}

		const payoutMethod = affiliate.payoutMethods.find((method) => method.id == id);

		if (!payoutMethod) {
			redirect('/affiliate');
		}

		const availableMethods = ['bank', 'cryptocurrency'];

		if (!availableMethods.includes(payoutMethod.method)) {
			return view('affiliate/payouts/method/Edit.svelte', {
				error: 'Invalid payout method'
			});
		}

		let details;
		const method = payoutMethod.method;

		switch (method) {
			case 'bank':
				const { accountCategory, accountType, routingNumber, accountNumber, accountName } =
					body;

				if (
					!accountCategory ||
					!accountType ||
					!routingNumber ||
					!accountNumber ||
					!accountName
				) {
					return view('affiliate/payouts/method/Edit.svelte', {
						error: 'Invalid payout details'
					});
				}

				details = {
					accountCategory,
					accountType,
					routingNumber,
					accountNumber,
					accountName
				};

				await Affiliate.updatePayoutMethod(userId, {
					id: payoutMethod.id,
					method,
					details
				});
				break;
			case 'cryptocurrency':
				const { coin, address } = body;

				if (!coin || !address) {
					return view('affiliate/payouts/method/Edit.svelte', {
						error: 'Invalid payout details'
					});
				}

				details = { coin, address };

				await Affiliate.updatePayoutMethod(userId, {
					id: payoutMethod.id,
					method,
					details
				});
				break;
			default:
				return view('affiliate/payouts/method/Edit.svelte', {
					error: 'Invalid payout method'
				});
		}

		return redirect('/affiliate');
	}
};
