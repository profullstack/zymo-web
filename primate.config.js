import svelte from "@primate/svelte";
import store from "@primate/store";
import {surrealdb} from "@primate/store";
import types from "@primate/types";
import session from "@primate/session";
import ws from "@primate/ws";
import esbuild from "@primate/esbuild";
import liveview from "@primate/liveview";

export default {
  modules: [
    svelte(),
    liveview(),
    store({
      strict: true,
      driver: surrealdb({
        host: "localhost",
        port: 5432,
        ns: "pfdao",
        db: "pfdao",
      }),
    }),
    types(),
    session(),
    ws(),
    esbuild(),
  ],
};
