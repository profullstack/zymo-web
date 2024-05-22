import env from 'rcompat/env';
import { primary } from '@primate/types';

export const actions = ({ connection: db }) => {
    return {
        async save(userId, mainCalendarEventId, userCalendarEventId) {

            try {
                const appointment = await db.create("appointments", { userId, mainCalendarEventId, userCalendarEventId });

                return appointment;

            } catch (e) {
                throw e;
                console.error(e)
            }

        },
        async delete(id) {
            try {

                const appointment = await db.delete(id);
                return appointment;
            } catch (e) {
                throw e;
                console.error(e)
            }
        },
        async getByUserId(id) {
            const query = `SELECT * FROM appointments WHERE userId = $id`;

            try {

                const appointment = await db.query(query, {
                    id
                });

                return appointment.pop().pop();
            } catch (e) {
                console.error(e)
                throw e;
            }
        }
    }
}

export default {
    id: primary
};