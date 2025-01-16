export default {
	async get(request) {
		const { store } = request;
		const { EmailArchive } = store;

		const emails = await EmailArchive.getAll();
		return emails;
	},

	async post(request) {
		const { store, body, session } = request;
		const {
			EmailArchive,
			external: { Mailgun }
		} = store;
		const { subject, emailBody, recipientType, emailId } = body;
		const userId = session.get('user').id;

		// If emailId is provided, we're resending to failed recipients
		if (emailId) {
			const failedDeliveries = await EmailArchive.getFailedDeliveriesByEmailId(emailId);
			const recipients = failedDeliveries.map(d => d.recipient);

			if (recipients.length === 0) {
				return { success: false, error: 'No failed deliveries found' };
			}

			// Track delivery status for each recipient
			const deliveryResults = await Promise.allSettled(
				recipients.map(async (to) => {
					const delivery = failedDeliveries.find(d => d.recipient === to);
					try {
						// Send email
						await Mailgun.send({
							to,
							subject: delivery.email_archive.subject,
							text: delivery.email_archive.body,
							from: process.env.FROM_EMAIL
						});

						// Update delivery status to sent
						await EmailArchive.updateDeliveryStatus({
							deliveryId: delivery.id,
							status: 'sent'
						});

						return { success: true, recipient: to };
					} catch (error) {
						// Update delivery status to failed with error
						await EmailArchive.updateDeliveryStatus({
							deliveryId: delivery.id,
							status: 'failed',
							error: error.message
						});

						return { success: false, recipient: to, error: error.message };
					}
				})
			);

			const results = deliveryResults.map(result => {
				if (result.status === 'fulfilled') {
					return result.value;
				} else {
					return { success: false, error: result.reason.message };
				}
			});

			const successCount = results.filter((r) => r.success).length;
			const failedCount = results.filter((r) => !r.success).length;

			return {
				success: true,
				emailId,
				totalRecipients: recipients.length,
				successCount,
				failedCount,
				deliveryResults: results
			};
		}

		// Regular email send to new recipients
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

		// Create email archive entry
		const emailArchive = await EmailArchive.create({
			subject,
			body: emailBody,
			recipientType,
			recipientCount: recipients.length,
			sentBy: userId
		});

		// Track delivery status for each recipient
		const deliveryResults = await Promise.allSettled(
			recipients.map(async (to) => {
				// Create delivery record
				const delivery = await EmailArchive.createDelivery({
					emailArchiveId: emailArchive.id,
					recipient: to
				});

				try {
					// Send email
					await Mailgun.send({
						to,
						subject,
						text: emailBody,
						from: process.env.FROM_EMAIL
					});

					// Update delivery status to sent
					await EmailArchive.updateDeliveryStatus({
						deliveryId: delivery.id,
						status: 'sent'
					});

					return { success: true, recipient: to };
				} catch (error) {
					// Update delivery status to failed with error
					await EmailArchive.updateDeliveryStatus({
						deliveryId: delivery.id,
						status: 'failed',
						error: error.message
					});

					return { success: false, recipient: to, error: error.message };
				}
			})
		);

		const results = deliveryResults.map(result => {
			if (result.status === 'fulfilled') {
				return result.value;
			} else {
				return { success: false, error: result.reason.message };
			}
		});

		const successCount = results.filter((r) => r.success).length;
		const failedCount = results.filter((r) => !r.success).length;

		return {
			success: true,
			emailId: emailArchive.id,
			totalRecipients: recipients.length,
			successCount,
			failedCount,
			deliveryResults: results
		};
	}
};
