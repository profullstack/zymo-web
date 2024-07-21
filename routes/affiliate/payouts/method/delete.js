import { error, Status, Response } from "primate";
import env from 'rcompat/env';

export default {

    async post(request) {
        const { store, session, body } = request;
        const { Affiliate } = store;
        const { id } = body;

        if (!id) {
            return error("Error", { status: Status.INTERNAL_SERVER_ERROR })
        }

        const userId = session.get("user").id;

        const affiliate = await Affiliate.getByUserId(userId);
        const payoutMethod = affiliate.payoutMethods.find((method) => method.id == id)

        if (!payoutMethod) {
            return error("Error", { status: Status.INTERNAL_SERVER_ERROR })
        }

        await Affiliate.deletePayoutMethod(userId, payoutMethod)

        return new Response("Ok", { status: Status.OK });
    },

}