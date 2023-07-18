import env from "runtime-compat/env";

export const ambiguous = true;

const {MAILGUN_DOMAIN: domain, MAILGUN_KEY: key, FROM_EMAIL: from} = env;
const resource = `https://api.mailgun.net/v3/${domain}/messages`;
const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}`,
  },
};
const body = ({subject, to, text}) =>
  `from=${from}&to=${encodeURIComponent(to)}&subject=${subject}&text=${text}`;

export const actions = () => {
  return {
    async send(mail) {
      try {
        await fetch(resource, {...options, body: body(mail)});
        console.log(`sent email to ${mail.to}`);
      } catch (error) {
        console.warn(error);
      }
    },
  };
};
