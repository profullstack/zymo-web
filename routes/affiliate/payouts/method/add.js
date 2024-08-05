import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get(request) {
		const { store, session } = request;
		const { Affiliate, Payout } = store;

		const userId = session.get('user').id;

		const affiliate = await Affiliate.getByUserId(userId);
		const payouts = await Payout.getAllByUserId(userId);

		return view('affiliate/payouts/method/Index.svelte', {
			affiliate,
			payouts
		});
	},

	async post(request) {
		const { store, session, body } = request;
		const { Affiliate, Payout } = store;

		const userId = session.get('user').id;
		const affiliate = await Affiliate.getByUserId(userId);

		if (!affiliate) {
			redirect('/affiliate');
		}

		const payoutMethods = affiliate.payoutMethods;

		const method = request.body.method;
		const availableMethods = ['bank', 'cryptocurrency'];

		if (!method || !availableMethods.includes(method)) {
			return view('affiliate/payouts/method/Index.svelte', {
				error: 'Invalid payout method'
			});
		}

		let details;
		const paymentMethodId = Affiliate.createPayoutMethodId();
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
					return view('affiliate/payouts/method/Index.svelte', {
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

				await Affiliate.addPayoutMethod(userId, {
					id: paymentMethodId,
					method,
					details
				});
				break;
			case 'cryptocurrency':
				const { coin, address } = body;

				if (!coin || !address) {
					return view('affiliate/payouts/method/Index.svelte', {
						error: 'Invalid payout details'
					});
				}

				details = { coin, address };

				await Affiliate.addPayoutMethod(userId, {
					id: paymentMethodId,
					method,
					details
				});
				break;
			default:
				return view('affiliate/payouts/method/Index.svelte', {
					error: 'Invalid payout method'
				});
		}

		return redirect('/affiliate');
	}
};
