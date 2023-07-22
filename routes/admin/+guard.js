import {redirect} from "primate";

export default request => {
  const {url: {pathname}, session} = request;

  if (session.get().admin) {
    return true;
  }

  return redirect(`/login?next=${pathname}`);
};
