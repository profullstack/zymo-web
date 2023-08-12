import env from "@runtime-compat/env";
import {primary} from "@primate/types";

export const actions = (db, store) => {
  return {
    async create(user) {
      let {email, username, password, password2} = user;
      const {DB_USER, DB_PASS, DB_NS, DB_DB} = env;

      if (password !== password2) {
        throw new Error("Passwords do not match");
      }

      username = username.replace(/[^a-zA-Z0-9]+/gu, "");
      console.log(user);

      const token = await db.signup({
        NS: DB_NS,
        DB: DB_DB,
        SC: "allusers",
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log("token: ", token);
      return token;
    },
  };
};

export default {
  id: primary,
};
