import {view} from "primate";

const form = (params = {}) => view("register/Form.svelte", {...params});

export default {
  get(request) {
    const {session, query} = request;

    if (session.exists) {
      // session exists
    } else {
      // show form
      return form();
    }
  },
  async post(request) {
    const {session, query, store} = request;

    const {Register: {Form}} = store;
    try {
      await Form.validate(request.body.get());
      const {External: {Mailgun}} = store;
      await Mailgun.send({
        to: request.body.get("email"),
        subject: "Your one-time login is 123456",
        text: "Use your one-time login 123456 to log in",
      });
//    await session.create({loggedIn: true});
      //return redirect(query.get("next") ?? "/");
      return "success";
    } catch({errors}) {
      return form({errors});
    }
  },
};
