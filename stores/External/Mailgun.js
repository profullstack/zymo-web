import env from "runtime-compat/env";

export const ambiguous = true;

const {MAILGUN_DOMAIN, MAILGUN_KEY} = env;
const resource = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
const key = Buffer.from(`api:${MAILGUN_KEY}`).toString("base64")
const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${key}`,
  }
};
const from = "donotreply@hynt.us";
const body = ({subject, to, text}) =>
  `from=${from}&to=${encodeURIComponent(to)}&subject=${subject}&text=${text}`;

export const actions = () => {
  return {
    async send(mail) {
      try {
        const result = await fetch(resource, {...options, body: body(mail)});
        console.log(`sent email to ${mail.to}`);
      } catch (error) {
        console.warn(error);
      }
    }
  }
}
