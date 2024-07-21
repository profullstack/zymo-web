import { view, Response, Status, redirect } from "primate";
import env from 'rcompat/env';
import { google } from 'googleapis';


const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APP_DOMAIN } = env;


export default {

  async get(request) {

    const { store, session, query } = request;
    const { User } = store
    const user = session.get("user")
    const code = query.get("code")

    try {

      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        `http://${APP_DOMAIN}`
      );

      const { tokens } = await oauth2Client.getToken(code);

      await User.updateGoogleRefreshToken(user.id, tokens.refresh_token);

      const me = await User.me();
      await session.set("user", me);

    } catch (e) {
      console.error(e);
      return new Response(Status.ERROR)
    }

    return new Response(Status.OK)
  },

  async post(request) {

    const { store, body, session } = request;
    const { User } = store
    const user = session.get("user")

    User.removeGoogleRefreshToken(user.id)

    const me = await User.me();
    await session.set("user", me);

    return new Response(Status.OK)

  }

}