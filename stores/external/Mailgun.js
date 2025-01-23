import Base64 from '@rcompat/string/Base64';
import { form } from '@rcompat/http/mime';
import primary from '@primate/types/primary';
import { createHash } from 'crypto';

const {
	APP_DOMAIN,
	TOLL_FREE,
	MAILGUN_DOMAIN,
	APP_NAME,
	MAILGUN_API_KEY,
	DO_NOT_REPLY,
	FROM_EMAIL,
	UNSUBSCRIBE_SECRET
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

const body = ({ subject, to, from, text, html }) => {
	const params = [
		`from=${from}`,
		`to=${to}`,
		`subject=${subject}`,
		`text=${text}`
	];
	
	if (html) {
		params.push(`html=${html}`);
	}
	
	return params.join('&');
};

function generateUnsubscribeToken(userId, email) {
	if (!UNSUBSCRIBE_SECRET) {
		console.error('UNSUBSCRIBE_SECRET environment variable is not set');
		return null;
	}
	console.log('Generating token for:', { userId, email });
	const data = `${userId}:${email}:${UNSUBSCRIBE_SECRET}`;
	const token = createHash('sha256').update(data).digest('hex');
	console.log('Generated token:', token);
	return token;
}

export const actions = () => {
	return {
		async send(mail) {
			try {
				// If this is a mass email (product update), add unsubscribe link
				if (mail.userId) {
					console.log('Adding unsubscribe link for:', { userId: mail.userId, email: mail.to });
					// Use the provided token if available, otherwise generate one
					const unsubscribeToken = mail.unsubscribeToken || generateUnsubscribeToken(mail.userId, mail.to);
					console.log('Using unsubscribe token:', unsubscribeToken);
					
					if (!unsubscribeToken) {
						console.error('Failed to generate unsubscribe token');
						return;
					}

					const unsubscribeUrl = `https://${APP_DOMAIN}/unsubscribe/${unsubscribeToken}`;
					console.log('Unsubscribe URL:', unsubscribeUrl);
					
					const unsubscribeFooter = `\n\n-------------------------\n\nTo unsubscribe from product updates and announcements, click here:\n${unsubscribeUrl}`;
					
					mail.text += unsubscribeFooter;
					
					if (mail.html) {
						mail.html += `<br><br><hr><p style="color: #666; font-size: 12px;">To unsubscribe from product updates and announcements, <a href="${unsubscribeUrl}">click here</a></p>`;
					}
				}

				console.log('Sending email:', { ...mail, options, body: body(mail) });
				const res = await fetch(resource, { ...options, body: body(mail) });
				console.log(`sent email to ${mail.to}`, await res.text());
				return res;
			} catch (error) {
				console.error('Error sending email:', error);
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
		},
		generateUnsubscribeToken
	};
};

export default {
	id: primary
};
