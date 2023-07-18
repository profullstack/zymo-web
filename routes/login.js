import {redirect, view} from "primate";

const form = (params = {}) => view("login/Form.svelte", {...params});

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

    const {Login: {Form}} = store;
    try {
      await Form.validate(request.body.get());
//    await session.create({loggedIn: true});
      //return redirect(query.get("next") ?? "/");
      return "success";
    } catch({errors}) {
      return form({errors});
    }
  },
};
