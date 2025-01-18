import Status from '@rcompat/http/Status';
import env from '@rcompat/env';
import Stripe from 'stripe';

export default {
	async post(request) {
		const { store } = request;
		const originalBody = request.body;
		const body = JSON.parse(request.body);

		const { STRIPE_WEBHOOK_SECRET } = process.env;

		const stripe = new Stripe(env.STRIPE_SK);

		const { User, Payment, Product, Referral, Affiliate, ReferralCode } = store;

		let event;

		const listen_events = [
			'customer.subscription.updated',
			'payment_intent.succeeded',
			'customer.subscription.deleted',
			'charge.succeeded',
			'charge.refunded',
			'charge.refund.updated'
		];

		if (!listen_events.includes(body.type)) return new Response(OK);

		try {
			event = stripe.webhooks.constructEvent(
				originalBody,
				request.headers.get('stripe-signature'),
				STRIPE_WEBHOOK_SECRET
			);
		} catch (err) {
			console.error('Webhook Error:', err);
			return new Response(`Webhook Error: ${err.message}`, Status.INTERNAL_SERVER_ERROR);
		}

		const session = body.data.object;

		const handlePaymentOrSubUpdate = async (session) => {
			const user = await User.getUserByStripeCustumerId(session.customer);

			var subscriptionRefunded = false;

			if (session.object == 'subscription') {
				var subscription = await Payment.getBySubscriptionId(session.id);
				if (subscription) {
					subscriptionRefunded =
						subscription.refunded && session.cancel_at_period_end == true;
				}
			}

			try {
				Payment.updateOrCreate(
					session.object == 'subscription'
						? {
								userId: user.id,
								status: session.status,
								amount: session.plan.amount / 100,
								subscriptionInterval: session.plan.interval,
								stripeSubscriptionId: session.id,
								stripePaymentIntent: session.payment_intent,
								refunded: subscriptionRefunded,
								renewalDate: session.current_period_end,
								productId: session.plan.product,
								cancelAtPeriodEnd: session.cancel_at_period_end
							}
						: {
								userId: user.id,
								status: session.refunded || 'active',
								amount: session.amount / 100,
								subscriptionInterval: '',
								stripeSubscriptionId: '',
								stripePaymentIntent: session.id,
								refunded: false,
								renewalDate: 0,
								productId: session.metadata.productId,
								cancelAtPeriodEnd: false
							}
				);
			} catch (e) {
				console.error(e);
			}
		};

		const addAffiliateCommission = async (session) => {
			try {
				const user = await User.getUserByStripeCustumerId(session.customer);
				const referral = await Referral.getReferralByUserId(user.id);

				if (referral) {
					const referralCode = await ReferralCode.getByCode(referral.referralCode);

					if (referralCode) {
						const originalAmount =
							session.amount / (100 - env.AFFILIATE_DISCOUNT_PERCENT);
						const commission = Math.round(
							originalAmount * (env.AFFILIATE_COMMISSION_PERCENT / 100)
						);

						await Affiliate.updateBalance(referralCode.affiliateId, commission);
						await ReferralCode.updateCommissions(referral.referralCode, commission);
					}
				}
			} catch (err) {
				console.error(err);
			}
		};

		const getPaymentIntentFromSubscription = async (subscriptionId) => {
			try {
				const subscription = await stripe.subscriptions.retrieve(subscriptionId);
				const latestInvoiceId = subscription.latest_invoice;

				if (!latestInvoiceId) {
					throw new Error('No invoice found for this subscription.');
				}
				const invoice = await stripe.invoices.retrieve(latestInvoiceId);

				const paymentIntentId = invoice.payment_intent;

				if (!paymentIntentId) {
					throw new Error('No payment intent found for this invoice.');
				}

				const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

				return paymentIntent;
			} catch (error) {
				console.error('Error retrieving payment intent from subscription:', error);
				throw error;
			}
		};

		switch (event.type) {
			case 'charge.succeeded':
				await addAffiliateCommission(session);
				break;
			case 'customer.subscription.updated':
				const payment_intent = await getPaymentIntentFromSubscription(session.id);
				session.payment_intent = payment_intent.id;

				await handlePaymentOrSubUpdate(session);
				break;
			case 'payment_intent.succeeded':
				if (!session.metadata || !session.metadata.productId) break;
				await handlePaymentOrSubUpdate(session);
				break;
			case 'customer.subscription.deleted':
				await handlePaymentOrSubUpdate(session);
				break;
			case 'charge.refunded':
			case 'charge.refund.updated':
				try {
					await Payment.updatePaymentRefund(session.payment_intent, session.status);
				} catch (err) {
					console.error(err);
				}

				break;
			case 'invoice.payment_succeeded':
				if (session['billing_reason'] == 'subscription_create') {
					const subscription_id = session['subscription'];
					const payment_intent_id = session['payment_intent'];

					const payment_intent = await stripe.paymentIntents.retrieve(payment_intent_id);

					await stripe.subscriptions.update(subscription_id, {
						default_payment_method: payment_intent.payment_method
					});
				}
				break;
		}

		return new Response(Status.OK);
	}
};
