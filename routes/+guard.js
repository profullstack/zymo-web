import {redirect} from "primate";

const open = ["/", "/login"];

export default request => {
  const {url: {pathname}, session} = request;

  if (open.includes(pathname) || session.get().loggedIn) {
    return true;
  }

  return redirect(`/login?next=${pathname}`);
};
