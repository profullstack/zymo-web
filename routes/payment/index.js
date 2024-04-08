import { view } from "primate";
import env from 'rcompat/env';
import Stripe from 'stripe'

export default {

  async post(request) {

    const stripe = new Stripe(env.STRIPE_SK);

    const { body, store } = request;
    const { stripeProductId, priceId } = body;
    const { APP_DOMAIN } = env

    const { User, Product } = store

    const user = request.session.get("user")

    var stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      try {

        const customer = await stripe.customers.create({
          email: user.email,
        });

        stripeCustomerId = customer.id;
        await User.updateStripeCustomerId(user.id, stripeCustomerId)

      } catch (e) {
        console.log(e)
        return { error: "error creating stripe customer", };
      }
    }

    const product = await Product.getByStripeProductId(stripeProductId)

    const payment_intent_data = product.mode !== "subscription" ? { metadata: { productId: stripeProductId } } : {};

    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer: stripeCustomerId,
        success_url: `http://${APP_DOMAIN}/payment/history`,
        cancel_url: `http://${APP_DOMAIN}/products`,
        mode: product.mode,
        payment_intent_data,
      }
    );

    return { url: session.url };
  }

};
