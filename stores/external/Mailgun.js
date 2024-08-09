import Base64 from '@rcompat/string/Base64';
import { form } from '@rcompat/http/mime';
import primary from '@primate/types/primary';

const {
	APP_DOMAIN,
	TOLL_FREE,
	MAILGUN_DOMAIN,
	APP_NAME,
	MAILGUN_API_KEY,
	DO_NOT_REPLY,
	FROM_EMAIL
} = process.env;

export const ambiguous = true;

const resource = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
const options = {
	method: 'POST',
	headers: {
		'Content-Type': form,
		Authorization: `Basic ${Base64.encode(`api:${MAILGUN_API_KEY}`)}`
	}
};
const body = ({ subject, to, from, text }) =>
	`from=${from}&to=${to}&subject=${subject}&text=${text}`;

export const actions = () => {
	return {
		async send(mail) {
			try {
				console.log({ ...options, body: body(mail) });
				const res = await fetch(resource, { ...options, body: body(mail) });
				console.log(`sent email to ${mail.to}`, await res.text());
				return res;
			} catch (error) {
				console.error(error);
			}
		},
		async sendVerifyEmail(cfg) {
			const { to, code } = cfg;

			let opts = {
				to,
				subject: `${APP_NAME} - Verification Code`,
				text: `Thanks for registering on https://${APP_DOMAIN}

-------------------------

Please click here to verify your email address:

https://${APP_DOMAIN}/verify/email/${code}

-------------------------

(Do not reply to this email, nobody receives replies at this email address).`,
				html: ``
			};

			try {
				const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
					method: 'POST',
					headers: {
						'Content-Type': form,
						Authorization: `Basic ${Base64.encode(`api:${MAILGUN_API_KEY}`)}`
					},
					body: `from=${FROM_EMAIL}&to=${encodeURIComponent(opts.to)}&subject=${opts.subject}&text=${opts.text}`
				});
				return res;
			} catch (err) {
				console.error(err);
			}
		},
		async sendPasswordResetEmail(cfg) {
			const { to, token } = cfg;

			let opts = {
				to,
				subject: `${APP_NAME} - Password Reset`,
				text: `We recieved a request to reset the password for your account

-------------------------

Please click here to reset your password:

https://${APP_DOMAIN}/reset/${token}

-------------------------

(Do not reply to this email, nobody receives replies at this email address).`,
				html: ``
			};

			try {
				const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
					method: 'POST',
					headers: {
						'Content-Type': form,
						Authorization: `Basic ${Base64.encode(`api:${MAILGUN_API_KEY}`)}`
					},
					body: `from=${FROM_EMAIL}&to=${encodeURIComponent(opts.to)}&subject=${opts.subject}&text=${opts.text}`
				});
				return res;
			} catch (err) {
				console.error(err);
			}
		}
	};
};

export default {
	id: primary
};
