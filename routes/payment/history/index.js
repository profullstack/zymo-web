import { view } from "primate";
import env from 'rcompat/env';
import Stripe from 'stripe'




export default {

  async get(request) {

    const { store, session } = request;
    const { Payment, Product } = store

    var payments = await Payment.getAllByUserId(session.get('user').id) || []


    payments = await Promise.all(await payments.map(async (payment) => {
      try {

        payment.product = await Product.getByStripeProductId(payment.productId)
        if(payment.stripeSubscriptionId) payment.renewalDate = new Date(payment.renewalDate * 1000) 

        return payment
      } catch (e) {
        console.log(e)
      }
    }))

    return view("Payments.svelte", { payments });
  },

};
