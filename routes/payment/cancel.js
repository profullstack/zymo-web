import Stripe from 'stripe';
import env from 'rcompat/env';

export default {
    async post(request) {

        const { store, session, body } = request;
        const { subscriptionId }  = body;
        const { Payment } = store;

        const stripe = new Stripe(env.STRIPE_SK);

        const subscription = await Payment.getBySubscriptionId(subscriptionId)
    
        if (subscription.status == "canceled" || subscription.cancelAtPeriodEnd == true)
            return {
                error: "subscription already canceled",
            };
        try {
            await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });

            return { success: true };
            
        } catch (err) {
            console.error(err);
            return  {
                error: "error cancelling subscription",
            };
        }


    }
}