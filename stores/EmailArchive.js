import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
	return {
		async getAll() {
			try {
				const query = `SELECT * FROM email_archive ORDER BY sent_at DESC`;
				const [emails] = await db.query(query);
				return emails;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},

		async create({ subject, body, recipientType, recipientCount, sentBy }) {
			try {
				const sent_at = new Date();
				const email = await db.create('email_archive', {
					subject,
					body,
					sent_at,
					recipient_type: recipientType,
					recipient_count: recipientCount,
					sent_by: sentBy
				});
				return email;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},

		async getAllUserEmails() {
			try {
				const query = `SELECT email FROM user WHERE email != ''`;
				const [users] = await db.query(query);
				return users.map((u) => u.email);
			} catch (e) {
				console.error(e);
				throw e;
			}
		},

		async getAllWaitlistEmails() {
			try {
				const query = `SELECT email FROM waitlist WHERE email != ''`;
				const [waitlist] = await db.query(query);
				return waitlist.map((w) => w.email);
			} catch (e) {
				console.error(e);
				throw e;
			}
		}
	};
};

export default {
	id: primary
};
