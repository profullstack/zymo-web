import { form } from "@rcompat/http/mime";
import Status from "@rcompat/http/Status";
import env from "@rcompat/env";

const url = "https://hcaptcha.com/siteverify";

export default {
  async get({ query }) {
    const { success } = await (await fetch(url, {
      method: "POST",
      headers:{
        "Content-Type": form,
      },
      body: new URLSearchParams({
        "sitekey": env.HCAPTCHA_SITEKEY,
        "secret": env.HCAPTCHA_SECRET,
        "response": query.get("token"),
      })
    })).json();

    const status = Status[success ? "OK" : "UNAUTHORIZED"];
  
    return new Response(null, { status });
  }
}
