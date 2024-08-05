// import { Response, Status, redirect, view } from 'primate';
import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get(request) {
		const { path, store } = request;
		const { Affiliate, User } = store;

		const id = path.get('id');

		if (!id) {
			redirect('/admin/affiliates');
		}

		const affiliate = await Affiliate.getById(id);

		if (!affiliate) {
			redirect('/admin/affiliates');
		}

		const userInfo = await User.getById(affiliate.userId);
		affiliate.userInfo = userInfo;

		return view('admin/affiliates/Payout.svelte', { affiliate });
	},

	async post(request) {
		const { store, body, path } = request;
		const { Affiliate, Payout, User } = store;

		const id = path.get('id');
		let { amount, payoutMethodId } = body;

		if (!id) {
			redirect('/admin/affiliates');
		}

		let affiliate = await Affiliate.getById(id);

		if (!affiliate) {
			redirect('/admin/affiliates');
		}

		const userInfo = await User.getById(affiliate.userId);
		affiliate.userInfo = userInfo;

		amount = parseFloat(amount);

		if (amount > affiliate.balance) {
			return view('admin/affiliates/Payout.svelte', {
				affiliate,
				error: 'Amount cannot be larger than affiliate balance'
			});
		}
		const payoutMethod = affiliate.payoutMethods.find((method) => method.id == payoutMethodId);

		if (!payoutMethod) {
			return view('admin/affiliates/Payout.svelte', {
				affiliate,
				error: 'Invalid payout method'
			});
		}

		const payout = await Payout.create(
			amount,
			payoutMethod.method,
			payoutMethod.details,
			affiliate.userId
		);

		if (payout) {
			affiliate = await Affiliate.payout(id, amount);
			affiliate.userInfo = userInfo;
		} else {
			return view('admin/affiliates/Payout.svelte', { affiliate, error: 'An error occured' });
		}

		return view('admin/affiliates/Payout.svelte', {
			affiliate,
			message: 'payout created successfully'
		});
	}
};
