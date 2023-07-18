import store from "@primate/store";
import surrealdb from "@primate/surrealdb";
import svelte from "@primate/svelte";
import session from "@primate/session";
import {Logger} from "primate";

export default {
  logger: {
    level: Logger.Info,
  },
  modules: [
    session(),
    store(surrealdb()),
    svelte(),
  ]
}
