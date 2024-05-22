import { view, Response, Status, redirect } from "primate";
import env from 'rcompat/env';
import { google } from 'googleapis';


const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APP_DOMAIN,
  GOOGLE_CALENDAR_ID,
} = env;

const getOAuth2Client = () => {

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `http://${APP_DOMAIN}`
  );

}

const getMainCalendar = async () => {

  const auth = new google.auth.GoogleAuth({
    keyFile: 'service_account_key.json',
    scopes: ['https://www.googleapis.com/auth/calendar']
  });


  const calendar = google.calendar({ version: 'v3', auth });

  return calendar;

}

const getUserCalendar = async (refresh_token) => {

  let oAuth2Client = getOAuth2Client();

  oAuth2Client.setCredentials({ refresh_token })

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  return calendar;

}

export default {

  async post(request) {

    const { store, session } = request;
    const { Appointment } = store;
    const user = session.get("user");

    const refreshToken = user.googleRefreshToken;
    const authorized = refreshToken ? true : false;

    if (!authorized) {
      return new Response(Status.ERROR)
    }

    try {

      const dbAppointment = await Appointment.getByUserId(user.id);

      if (dbAppointment) {
        const mainCalendar = await getMainCalendar();
        const userCalendar = await getUserCalendar(refreshToken)

        try {
          await mainCalendar.events.delete({ calendarId: GOOGLE_CALENDAR_ID, eventId: dbAppointment.mainCalendarEventId })
        } catch (e) { console.error(e) }

        try {
          await userCalendar.events.delete({ calendarId: 'primary', eventId: dbAppointment.userCalendarEventId })
        } catch (e) { console.error(e) }

        await Appointment.delete(dbAppointment.id)

      }

    } catch (e) {
      console.error(e);
      return new Response(Status.ERROR)
    }

    return new Response(Status.OK)

  }

}