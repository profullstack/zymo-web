import {redirect} from "primate";

export default request => {
  const {url: {pathname}, session} = request;

  console.log('loggedIn:', session.get().token);

  if (session.get().token) {
    return true;
  }

  return redirect(`/login?next=${pathname}`);
};
