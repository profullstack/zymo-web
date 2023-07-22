import store from "@primate/store";
import surrealdb from "@primate/surrealdb";
import svelte from "@primate/svelte";
import session from "@primate/session";
import {Logger} from "primate";
import env from "runtime-compat/env";

const {
  PORT: port,
  DB_USER: user, DB_PASS: pass, DB_HOST: host, DB_NS: ns, DB_PORT: db_port,
} = env;

export default {
  http: {
    /*
      ssl: {
        key: "./ssl/default.key",
        cert: "./ssl/default.crt",
      },
    */
    port,
  },
  logger: {
    level: env.DEBUG ? Logger.Info : Logger.Warn,
    trace: true,
  },
  modules: [
    session(),
    store(surrealdb({host, port: db_port, ns, user, pass})),
    svelte(),
  ],
};
