import {view} from "primate";

export default ({session}) => {
  const isLoggedIn = Boolean(session.exists && session.get().token);
  console.log('isLoggedIn2:', isLoggedIn);
  
  return view("Layout.svelte", {hello: "world", isLoggedIn});
};
