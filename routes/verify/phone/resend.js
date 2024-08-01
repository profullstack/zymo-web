import { error, Status, Response } from "primate";
import env from 'rcompat/env';
const { FROM_EMAIL } = env;

export default {
    async post(request) {
        const { body, session, store } = request;
        const { User, external: { Twilio } } = store;

        const user = session.get("user");
        const phone = user.phonePrefix + user.phone;

        const dbUser = await User.getById(user.id)

        if (dbUser.verify.phone.status !== "verified") {
            const result = await User.generatePhoneVerifyCode(user.id);
            const code = result.verify.phone.code

            if (code) {
                const response = await Twilio.sendPhoneVerificationCode({ to: phone, code })

                if (response && !response?.errorCode) {
                    return "";
                }
            }
        }

        return error("Error", { status: Status.INTERNAL_SERVER_ERROR })
    }
};
