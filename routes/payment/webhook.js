import { Response, Status } from "primate";
import env from 'rcompat/env';
import Stripe from 'stripe';


function stringifyStripeBody(object) {
    var string = JSON.stringify(object, null, 2);

    string = string.replaceAll(/(.*)"(.*)": \[\]/g, (_, space, name) => `${space}"${name}": [\n${space}]`);
    string = string.replaceAll(/(.*)"(.*)": {}/g, (_, space, name) => `${space}"${name}": {\n${space}}`);

    return string;
}



export default {

    async post(request) {
        let { store, body } = request;
        let { STRIPE_WEBHOOK_SECRET } = process.env;

        const stripe = new Stripe(env.STRIPE_SK);

        const { User, Payment, Product, Referral, Affiliate } = store;

        let event;

        const listen_events = ['customer.subscription.updated', 'payment_intent.succeeded', 'customer.subscription.deleted', 'charge.succeeded']

        if (!listen_events.includes(body.type)) return new Response(Status.OK)

        try {
            event = stripe.webhooks.constructEvent(stringifyStripeBody(body), request.headers.get('stripe-signature'), STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.log("Webhook Error:", err)
            return new Response(`Webhook Error: ${err.message}`, Status.ERROR)
        }


        const session = body.data.object;
        const sessionId = session.id;

        const handlePaymentOrSubUpdate = async (session) => {
            const user = await User.getUserByStripeCustumerId(session.customer);

            try {
                Payment.updateOrCreate(
                    session.object == "subscription"
                        ? {
                            userId: user.id,
                            status: session.status,
                            subscriptionInterval: session.plan.interval,
                            stripeSubscriptionId: session.id,
                            renewalDate: session.current_period_end,
                            productId: session.plan.product,
                            cancelAtPeriodEnd: session.cancel_at_period_end,
                        }
                        : {
                            userId: user.id,
                            status: "active",
                            subscriptionInterval: "",
                            stripeSubscriptionId: "",
                            renewalDate: 0,
                            productId: session.metadata.productId,
                            cancelAtPeriodEnd: false,
                        }
                )
            } catch (e) {
                console.log(e)
            }
        }

        const addAffiliateCommission = async (session) => {
            try {
                const user = await User.getUserByStripeCustumerId(session.customer);
                const referral = await Referral.getReferralByUserId(user.id);

                if (referral) {
                    const affiliate = await Affiliate.getByReferralCode(referral.referralCode);

                    if (affiliate) {
                        const commission = Math.round(((session.amount / 100) / 0.9) * 0.1);
                        await Affiliate.addCommission(affiliate.id, affiliate.commissions + commission);
                    }
                }
            } catch (err) {
                console.error(err)
            }
        }

        switch (event.type) {
            case "charge.succeeded":
                await addAffiliateCommission(session);
                break;
            case "customer.subscription.updated":
                await handlePaymentOrSubUpdate(session);
                break;
            case "payment_intent.succeeded":
                if (!session.metadata || !session.metadata.productId) break;
                await handlePaymentOrSubUpdate(session);
                break;
            case "customer.subscription.deleted":
                await handlePaymentOrSubUpdate(session);
                break;
            case "invoice.payment_succeeded":

                if (session["billing_reason"] == "subscription_create") {
                    const subscription_id = session["subscription"];
                    const payment_intent_id = session["payment_intent"];

                    const payment_intent = await stripe.paymentIntents.retrieve(
                        payment_intent_id
                    );

                    await stripe.subscriptions.update(subscription_id, {
                        default_payment_method: payment_intent.payment_method,
                    });
                }
                break;
        }

        return new Response(Status.OK)
    }
}