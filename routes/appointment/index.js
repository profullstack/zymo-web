import { view, Response } from "primate";
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

const acceptSharedCalendar = async (calendar) => {

  const response = await calendar.calendarList.list();
  const calendars = response.data.items;

  let calendarFound = false;
  for (const cal of calendars) {
    if (cal.id === calendarId || cal.summary.includes(calendarId)) {
      calendarFound = true;
      break;
    }
  }

  if (!calendarFound) {
    const permission = await calendar.acl.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      resource: {
        role: 'none',
        scope: {
          type: 'default',
          value: ''
        }
      }
    });
  }

}

const getMainCalendar = async () => {

  const auth = new google.auth.GoogleAuth({
    keyFile: 'service_account_key.json',
    scopes: ['https://www.googleapis.com/auth/calendar']
  });


  const calendar = google.calendar({ version: 'v3', auth });

  await acceptSharedCalendar(calendar)

  return calendar;

}

const getUserCalendar = async (refresh_token) => {

  let oAuth2Client = getOAuth2Client();

  oAuth2Client.setCredentials({ refresh_token })

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  return calendar;

}

const checkMainCalendarConflicts = async (startTime, endTime) => {

  const calendar = await getMainCalendar()


  const events = await calendar.events.list({
    calendarId: GOOGLE_CALENDAR_ID,
    timeMin: startTime,
    timeMax: endTime,
    singleEvents: true,
    timeZone: 'UTC',
    orderBy: 'startTime',
  });

  if (events.data.items && events.data.items.length > 0) {
    return true;
  }

  return false;

}

const checkUserCalendarConflicts = async (refresh_token, startTime, endTime) => {

  const calendar = await getUserCalendar(refresh_token);

  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startTime,
    timeMax: endTime,
    singleEvents: true,
    timeZone: 'UTC',
    orderBy: 'startTime',
  });

  if (events.data.items && events.data.items.length > 0) {
    return true;
  }

  return false;

}

const addEventToMainCalendar = async (summary, description, startTime, endTime, recurring, type) => {

  const calendar = await getMainCalendar();
  let resource = {
    summary,
    description,
    start: {
      dateTime: startTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime,
      timeZone: 'UTC',
    },
    sendUpdates: 'all',
    extendedProperties: {
      shared: {
        type
      }
    },
  }
  if (recurring && recurring !== 'disabled')
    switch (recurring) {
      case 'daily':
        resource.recurrence = ['RRULE:FREQ=DAILY;'];
        break;
      case 'weekly':
        resource.recurrence = ['RRULE:FREQ=WEEKLY;'];
        break;
      case 'monthly':
        resource.recurrence = ['RRULE:FREQ=MONTHLY;'];
        break;
      default:
        break;

    }

  const event = await calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_ID,
    resource
  });

  return event.data;
}

const addEventToUserCalendar = async (summary, description, startTime, endTime, recurring, type, refreshToken) => {

  const calendar = await getUserCalendar(refreshToken);

  let resource = {
    summary,
    description,
    start: {
      dateTime: startTime,
      timeZone: 'UTC'
    },
    end: {
      dateTime: endTime,
      timeZone: 'UTC'
    },
    sendUpdates: 'all',
    extendedProperties: {
      shared: {
        type
      }
    },
  }



  if (recurring && recurring !== 'disabled')
    switch (recurring) {
      case 'daily':
        resource.recurrence = ['RRULE:FREQ=DAILY;'];
        break;
      case 'weekly':
        resource.recurrence = ['RRULE:FREQ=WEEKLY;'];
        break;
      case 'monthly':
        resource.recurrence = ['RRULE:FREQ=MONTHLY;'];
        break;
      default:
        break;

    }

  const event = await calendar.events.insert({
    calendarId: 'primary',
    resource,
  });

  return event.data

}

const getAppointment = async (id, appointmentStore, mainCalendarEventId, userCalendarEventId, refreshToken) => {

  if (mainCalendarEventId && userCalendarEventId) {

    const [mainCalendar, userCalendar] = await Promise.all([
      getMainCalendar(),
      getUserCalendar(refreshToken).catch((error) => {
        return null;
      }),
    ]);

    if (!mainCalendar || !userCalendar) {
      return 'error';
    }

    let [mainCalendarEvent, userCalendarEvent] = await Promise.all([
      mainCalendar.events.get({ calendarId: GOOGLE_CALENDAR_ID, eventId: mainCalendarEventId }),
      userCalendar.events.get({ calendarId: 'primary', eventId: userCalendarEventId }),
    ]).catch((error) => {
      return [null, null];
    });


    mainCalendarEvent = mainCalendarEvent?.data
    userCalendarEvent = userCalendarEvent?.data

    if (userCalendarEvent?.status === "cancelled" && mainCalendarEvent?.status !== "cancelled") {
      await mainCalendar.events.delete({ calendarId: GOOGLE_CALENDAR_ID, eventId: mainCalendarEventId });
      await appointmentStore.delete(id);
      return null;
    }

    if (mainCalendarEvent?.status === "cancelled" && userCalendarEvent?.status !== "cancelled") {
      await userCalendar.events.delete({ calendarId: 'primary', eventId: userCalendarEventId });
      await appointmentStore.delete(id);
      return null;
    }

    if (userCalendarEvent?.status == "cancelled" && mainCalendarEvent?.status == "cancelled") {
      await appointmentStore.delete(id);
      return null;
    }


    if (mainCalendarEvent.end.dateTime < Date.now()) {

      await appointmentStore.delete(userId);
      return null;
    }

    return userCalendarEvent;



  }

  return null;

}

const getEndTime = (startTime, duration) => {

  const startTimeObj = new Date(startTime);

  let endHours = startTimeObj.getHours();
  let endMinutes = startTimeObj.getMinutes() + duration;

  if (endMinutes >= 60) {
    endHours += Math.floor(endMinutes / 60);
    endMinutes %= 60;
  }

  startTimeObj.setHours(endHours, endMinutes);
  return startTimeObj.toISOString();
}

export default {

  async get(request) {

    const { store, session } = request;
    const { Appointment, User } = store;
    const user = session.get("user");
    const refreshToken = user.googleRefreshToken;

    const authorized = refreshToken ? true : false;

    let appointment = null;



    if (authorized) {
      const dbAppointment = await Appointment.getByUserId(user.id);
      if (dbAppointment) {
        try {
          appointment = await getAppointment(dbAppointment.id, Appointment, dbAppointment.mainCalendarEventId, dbAppointment.userCalendarEventId, refreshToken)

          if (appointment == "error") {
            return view("Appointment.svelte", { authorized, error: "An error occured while fetching appointment, If the issue persists try reauthenticating google calendar" });
          }
        } catch (e) { }
      }
    }

    console.log(appointment)

    return view("Appointment.svelte", { GOOGLE_CLIENT_ID, authorized, appointment });
  },

  async post(request) {
    const { store, session, body } = request;
    const { Appointment } = store;
    const { summary, description, datetime, duration, recurring, type } = body;
    const user = session.get("user");

    const refreshToken = user.googleRefreshToken;
    const authorized = refreshToken ? true : false;


    try {

      if (!summary || !description || !datetime || !duration || !type || !recurring) {
        return view("Appointment.svelte", { authorized, error: "Please fill out all fields" });

      }

      const startTime = new Date(datetime);

      const endTime = type == "pickup" ? startTime : getEndTime(startTime, duration);

      if (startTime < Date.now()) {

        return view("Appointment.svelte", { authorized, error: "Please select a date in the future" });
      }

      if (!authorized) {
        return view("Appointment.svelte", { authorized, GOOGLE_CLIENT_ID, error: "Please authorize google calendar" })
      }

      const dbAppointment = await Appointment.getByUserId(user.id);

      if (dbAppointment) {
        let appointment = await getAppointment(dbAppointment.id, Appointment, dbAppointment.mainCalendarEventId, dbAppointment.userCalendarEventId, refreshToken);
        if (appointment) {
          return view("Appointment.svelte", { authorized, appointment, error: "You already have a scheduled appointment" });
        }
      }


      const mainCalendarConflicts = await checkMainCalendarConflicts(startTime, endTime);

      if (mainCalendarConflicts) {

        return view("Appointment.svelte", { authorized, error: "Sorry, We are unavailable at that time" });
      }

      const userCalendarConflicts = await checkUserCalendarConflicts(refreshToken, startTime, endTime);

      if (userCalendarConflicts) {
        return view("Appointment.svelte", { authorized, error: "You already have an event set at that time" });
      }

      const mainCalendarEvent = await addEventToMainCalendar(summary, description, startTime, endTime, recurring, type)
      const userCalendarEvent = await addEventToUserCalendar(summary, description, startTime, endTime, recurring, type, refreshToken)

      userCalendarEvent.start.dateTime = startTime
      userCalendarEvent.end.dateTime = endTime;

      await Appointment.save(user.id, mainCalendarEvent.id, userCalendarEvent.id)

      return view("Appointment.svelte", { authorized, appointment: userCalendarEvent, success: "Your appointment has been scheduled successfully" });

    } catch (e) {
      console.error(e)
      return view("Appointment.svelte", { authorized, error: "An error occured, If the issue persists try reauthenticating google calendar" });
    }



  }

}