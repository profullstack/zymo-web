import {redirect} from "primate";

export default request => {
  const {url: {pathname}, session} = request;

  console.log('loggedIn:', session.get().loggedIn);

  if (session.get().loggedIn) {
    return true;
  }

  return redirect(`/login?next=${pathname}`);
};
