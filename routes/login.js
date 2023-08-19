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
      let token;
      let me;

      try {
        token = await User.signin(user);
        me = await User.me();
      } catch(err) {
        return form({ status: err.message });
      }


      await session.create({token, user: me, loggedIn: Boolean(token)});

      return redirect(home);
    } catch({errors}) {
      return form({errors});
    }
  },
};
