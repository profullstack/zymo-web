import { view } from "primate";

export default ({ session }) => {
  const isLoggedIn = Boolean(session.exists() && session.get("loggedIn"));
  const unverifiedUser = Boolean(session.exists() && session.get("unverifiedEmail"))

  return view("Layout.svelte", { hello: "world", isLoggedIn, unverifiedUser });
};
