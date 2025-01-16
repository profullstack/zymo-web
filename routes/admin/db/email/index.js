import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store } = request;
		const { EmailArchive } = store;

		const emails = await EmailArchive.getAll();
		return view('admin/db/Email.svelte', { emails });
	},

	async post(request) {
		const { store, body, session } = request;
		const {
			EmailArchive,
			external: { Mailgun }
		} = store;
		const { subject, emailBody, recipientType } = body;
		const userId = session.get('user').id;

		// Get recipients based on type
		let recipients = [];
		if (recipientType === 'all_users' || recipientType === 'both') {
			const userEmails = await EmailArchive.getAllUserEmails();
			recipients = recipients.concat(userEmails);
		}
		if (recipientType === 'all_waitlist' || recipientType === 'both') {
			const waitlistEmails = await EmailArchive.getAllWaitlistEmails();
			recipients = recipients.concat(waitlistEmails);
		}

		// Remove duplicates
		recipients = [...new Set(recipients)];

		// Send emails
		for (const to of recipients) {
			await Mailgun.send({
				to,
				subject,
				text: emailBody,
				from: process.env.FROM_EMAIL
			});
		}

		// Archive the email
		await EmailArchive.create({
			subject,
			body: emailBody,
			recipientType,
			recipientCount: recipients.length,
			sentBy: userId
		});

		return { success: true, recipientCount: recipients.length };
	}
};
