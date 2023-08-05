import env from "runtime-compat/env";
import { Base64 } from "runtime-compat/string";
// use `import {MediaType} from "primate";` in primate 0.21
import { MediaType } from "runtime-compat/http";

export const ambiguous = true;

const { MAILGUN_DOMAIN: domain, MAILGUN_KEY: key, FROM_EMAIL: from } = env;
const resource = `https://api.mailgun.net/v3/${domain}/messages`;
const options = {
  method: "POST",
  headers: {
    "Content-Type": MediaType.APPLICATION_FORM_URLENCODED,
    Authorization: `Basic ${Base64.encode(`api:${key}`)}`,
  },
};
const body = ({ subject, to, text }) =>
  `from=${from}&to=${encodeURIComponent(to)}&subject=${subject}&text=${text}`;

export const actions = () => {
  return {
    async send(mail) {
      try {
        await fetch(resource, { ...options, body: body(mail) });
        console.log(`sent email to ${mail.to}`);
      } catch (error) {
        console.warn(error);
      }
    },
  };
};
