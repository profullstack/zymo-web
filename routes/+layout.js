import {view} from "primate";

export default ({session}) => {
  const token = session.exists ? session.get("token") : null;
  return view("Layout.svelte", {hello: "world", token});
};
