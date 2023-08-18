import env from "runtime-compat/env";
import {primary} from "@primate/types";

export const actions = (db, store) => {
  return {
    async me() {
      const me = await db.info();
      delete me.password;
      console.log("me: ", me.email);
      return me;
    },
    async generateEmailVerifyCode(id) {
      const code = Math.random().toString(36).substr(2, 10);
      const expiration = new Date(Date.now() + 2 * (60 * 60 * 1000));

      const result = (
        await db.query("UPDATE $id SET verify.email.code = $code, verify.email.status = 'pending', verify.email.expiration = $expiration", {
          id,
          code,
          expiration,
        })
      ).pop()
        .result
        .pop();

      console.log('user: ', result);
      return result;
    },
    async generatePhoneVerifyCode(id) {
      const code = Math.random().toString().substr(2, 6);
      const expiration = new Date(Date.now() + 2 * (60 * 60 * 1000));

      const result = (
        await db.query("UPDATE $id SET verify.phone.code = $code, verify.phone.status = 'pending', verify.phone.expiration = $expiration", {
          id,
          code,
          expiration,
        })
      ).pop()
        .result
        .pop();

      console.log("user: ", result);
      return result;
    },
    async create(user) {
      console.log('create:', user);
      let {email, username, password, password2} = user;
      const {DB_NS, DB_DB} = env;

      console.log('db:', DB_NS, DB_DB)

      if (password !== password2) {
        throw new Error("Passwords do not match");
      }

      username = username.replace(/[^a-zA-Z0-9]+/g, "");
      console.log('user:', user);

      try {
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
      } catch(err) {
        console.error(err);
        throw(err);        
      }
    },
    async signin(user) {
      const {email, password} = user;
      const {DB_NS, DB_DB} = env;

  		console.log(user);

      try {
        const token = await db.signin({
          NS: DB_NS,
          DB: DB_DB,
          SC: "allusers",
          email,
          password,
        });

        console.log("token: ", token);

        const me = await this.me();
        const {id} = me;
        const now = new Date();

        await db.query("UPDATE $id SET loggedInAt = $now", {
          id,
          now,
        });

        return token;
      } catch (err) {
        throw new Error(err);
      }
    },
  };
};

export default {
  id: primary,
};
