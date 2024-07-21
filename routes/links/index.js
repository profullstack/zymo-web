import { view, redirect } from "primate";
const form = (params = {}) => view("links/Form.svelte", { ...params });

export default {
	get(request) {
	  const { session } = request;
	  return form();
	},
	async post(request) {
	  const { session, store } = request;
	  const {
	    link: { Form, Link },
	  } = store;

	  console.log("foo2:", session.get("user"), "token2:", session.get("token"));
	  try {
	    const data = request.body;

	    await Form.validate(data);

	    try {
	      const link = await Link.create(data, session.get("token"));
	      console.log("link:", link);
	      return redirect("/dashboard");
	    } catch (err) {
	      return form({ status: err.message });
	    }
	  } catch ({ errors }) {
	    return form({ errors });
	  }
	},
};
