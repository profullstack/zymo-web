import twilio from 'twilio';

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const sms = twilio(twilioAccountSid, twilioAuthToken);
const { DOMAIN, TOLL_FREE, MAILGUN_DOMAIN, APP_NAME, MAILGUN_KEY, DO_NOT_REPLY } = process.env;

export default class Base {
	async getSessionData(ctx) {
		const session = await ctx.session();

		console.log('session: ', session);

		return session;
	}

	async sendVerifyEmail(cfg) {
		const { to, code } = cfg;

		let opts = {
			to,
			subject: `${APP_NAME} - Verification Code`,
			text: `Thanks for registering on https://${DOMAIN}

					-------------------------

					Please click here to verify your email address:
					
					https://${DOMAIN}/verify/email/${code}

					-------------------------

					(Do not reply to this email, nobody receives replies at this email address).
					
					`,
			html: ``
		};

		try {
			console.log('send email');
			console.log(opts, MAILGUN_DOMAIN, MAILGUN_KEY, DO_NOT_REPLY);
			const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: 'Basic ' + Buffer.from('api' + ':' + MAILGUN_KEY).toString('base64')
				},
				body: `from=${DO_NOT_REPLY}&to=${encodeURIComponent(opts.to)}&subject=${opts.subject}&text=${opts.text}`
			});
			console.log(res, '<---- mailgun');
		} catch (err) {
			console.error(err);
		}
	}

	async sendVerifyPhone(cfg) {
		const { to, code } = cfg;
		const res = await sms.messages
			.create({
				body: `Click here to verify your phone: https://${DOMAIN}/verify/phone/${code}`,
				// from: '+18886902204',
				from: TOLL_FREE,
				to
			});

		console.log(res, '<----- twilio sms');
	}
}

