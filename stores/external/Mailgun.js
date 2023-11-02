import env from 'runtime-compat/env';
import { Base64 } from 'runtime-compat/string';
import { MediaType } from 'runtime-compat/http';

export const ambiguous = true;

const { MAILGUN_DOMAIN: domain, MAILGUN_KEY: key } = env;
const resource = `https://api.mailgun.net/v3/${domain}/messages`;
const options = {
	method: 'POST',
	headers: {
		'Content-Type': MediaType.APPLICATION_FORM_URLENCODED,
		Authorization: `Basic ${Base64.encode(`api:${key}`)}`
	}
};
const body = ({ subject, to, from, text }) =>
	`from=${from}&to=${to}&subject=${subject}&text=${text}`;

export const actions = () => {
	return {
		async send(mail) {
			try {
				const res = await fetch(resource, { ...options, body: body(mail) });
				console.log(`sent email to ${mail.to}`, await res.text());
			} catch (error) {
				console.error(error);
			}
		}
	};
};
