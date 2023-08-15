import svelte from "@primate/svelte";
import store from "@primate/store";
import { surrealdb } from "@primate/store";
import types from "@primate/types";
import session from "@primate/session";
import ws from "@primate/ws";
import esbuild from "@primate/esbuild";
import liveview from "@primate/liveview";
import env from "runtime-compat/env";

const {
  PORT: port,
  DB_USER: user,
  DB_PASS: pass,
  DB_HOST: host,
  DB_NS: ns,
  DB_PORT: db_port,
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
  modules: [
    svelte(),
    liveview(),
    store({
      strict: true,
      driver: surrealdb({
        host,
        port: db_port,
        ns,
        user,
        pass,
      }),
    }),
    types(),
    session(),
    ws(),
    esbuild(),
  ],
};
