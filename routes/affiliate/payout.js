import { view, redirect } from "primate";
import env from 'rcompat/env';

export default {

    async get(request) {
        const { store, session } = request;
        const { Affiliate, Payout } = store;

        const userId = session.get("user").id;

        const affiliate = await Affiliate.getByUserId(userId);
        const payouts = await Payout.getAllByUserId(userId);

        return view('affiliate/Payout.svelte', {
            affiliate,
            payouts
        });
    },

    async post(request) {

        const { store, session, body } = request;
        const { Affiliate, Payout } = store;

        const userId = session.get("user").id;
        const affiliate = await Affiliate.getByUserId(userId);
        let payouts = await Payout.getAllByUserId(userId);

        const pendingPayout = payouts.find((payout) => payout.status == "pending");

        if (pendingPayout) {
            return view('affiliate/Payout.svelte', {
                affiliate,
                payouts,
                error: "You already have a pending payout"
            });
        }

        const method = request.body.method;
        //const amount = Number(request.body.amount) || 0;

        const availableMethods = ["bank", "cryptocurrency"];

        if (!method || !availableMethods.includes(method)) {
            return view('affiliate/Payout.svelte', {
                affiliate,
                payouts,
                error: "Invalid payout method"
            });
        }

        /*
        if (amount > affiliate.balance || amount <= 0) {
            return view('affiliate/Payout.svelte', {
                affiliate,
                payouts,
                error: "Invalid payout amount"
            });
        }*/
        
        let details;
        let payout;
        switch (method) {
            case "bank":
                const { accountCategory, accountType, routingNumber, accountNumber, accountName } = body;

                if (!accountCategory || !accountType || !routingNumber || !accountNumber || !accountName) {
                    return view('affiliate/Payout.svelte', {
                        affiliate,
                        payouts,
                        error: "Invalid payout details"
                    });
                }

                details = { accountCategory, accountType, routingNumber, accountNumber, accountName }
                payout = await Payout.create(method, "pending", details, userId);
                
                payouts.unshift(payout)
                break;
            case "cryptocurrency":
                const { coin, address } = body;

                if (!coin || !address) {
                    return view('affiliate/Payout.svelte', {
                        affiliate,
                        payouts,
                        error: "Invalid payout details"
                    });
                }

                details = { coin, address };
                payout = await Payout.create(method, "pending", details, userId);

                payouts.unshift(payout)
                break;
            default:
                return view('affiliate/Payout.svelte', {
                    affiliate,
                    payouts,
                    error: "Invalid payout method"
                });

        }

        return view('affiliate/Payout.svelte', {
            affiliate,
            payouts
        });

    }

}