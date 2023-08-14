import {view, redirect} from "primate";

const form = (params = {}) => view("login/Form.svelte", {...params});
const home = "/dashboard";

export default {
  get(request) {
    const {session} = request;

    if (session.exists) {
      // already logged in, redirect to dashboard
      return redirect(home);
    }

    // show form
    return form();
  },
  async post(request) {
    const {session, store} = request;

    const {login: {Form}, User} = store;
    try {
      const user = request.body.get();

      await Form.validate(user);

      const token = await User.login(user);

      await session.create({token, user: await User.me()});

      // todo: add a way to flash something to the user, can use a hash for now
      // for example: /dashboard#flash=Some message
      return redirect(home);
    } catch({errors}) {
      return form({errors});
    }
  },
};
