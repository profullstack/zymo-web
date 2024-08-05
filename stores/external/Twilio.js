import twilio from 'twilio';

export const ambiguous = true;
export const actions = () => {
    return {
        async sendPhoneVerificationCode(cfg) {
            const { to, code } = cfg;

            const sms = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

            const res = await sms.messages
                .create({
                    body: `Your ${APP_NAME} phone verification code is: ${code}`,
                    from: TWILIO_PHONE_NUMBER,
                    to
                });
            console.log(res, "<---- Twilio")
            return res;
        }
    };
};
