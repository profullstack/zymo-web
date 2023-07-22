import {redirect} from "primate";

export default request => {
  const {url: {pathname}, session} = request;

  if (session.get().loggedIn) {
    return true;
  }

  return redirect(`/login?next=${pathname}`);
};
