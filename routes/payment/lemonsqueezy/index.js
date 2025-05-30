import redirect from 'primate/handler/redirect';
import Stripe from 'stripe';

const { env } = process;

const stripe = new Stripe(env.STRIPE_SK);

const getReferralCoupon = async () => {
	let coupon;

	try {
		const coupons = await stripe.coupons.list();
		coupon = coupons.data.filter((coupon) => coupon.percent_off == 10)[0];
		if (!coupon) {
			coupon = await stripe.coupons.create({
				duration: 'forever',
				percent_off: env.AFFILIATE_DISCOUNT_PERCENT
			});
		}
	} catch (err) {
		console.error(err);
	}

	return coupon;
};

export default {
	async get() {
		return redirect('/products');
	},
	async post(request) {
		const { body, store } = request;
		const { stripeProductId, priceId } = body;
		const { APP_DOMAIN } = env;

		const { User, Product, Referral } = store;

		const user = request.session.get('user');

		var stripeCustomerId = user.stripeCustomerId;

		if (!stripeCustomerId) {
			try {
				const customer = await stripe.customers.create({
					email: user.email
				});

				stripeCustomerId = customer.id;
				await User.updateStripeCustomerId(user.id, stripeCustomerId);
			} catch (e) {
				console.log(e);
				return { error: 'error creating stripe customer' };
			}
		}

		const product = await Product.getByStripeProductId(stripeProductId);

		const payment_intent_data =
			product.mode !== 'subscription' ? { metadata: { productId: stripeProductId } } : {};

		const coupon = await getReferralCoupon();
		const referral = await Referral.getReferralByUserId(user.id);

		let checkoutData = {
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			customer: stripeCustomerId,
			success_url: `http://${APP_DOMAIN}/payment/history`,
			cancel_url: `http://${APP_DOMAIN}/products`,
			mode: product.mode,
			payment_intent_data
		};

		if (referral && coupon && env.AFFILIATE_DISCOUNT_PERCENT) {
			checkoutData.discounts = [
				{
					coupon: coupon.id
				}
			];
		}

		const session = await stripe.checkout.sessions.create(checkoutData);

		return { url: session.url };
	}
};
