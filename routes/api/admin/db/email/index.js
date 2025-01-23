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
						// Generate unsubscribe token if this is a user email
						const unsubscribeToken = delivery.user_id ? Mailgun.generateUnsubscribeToken(delivery.user_id, to) : null;
						
						// Send email
						await Mailgun.send({
							to,
							subject: delivery.email_archive.subject,
							text: delivery.email_archive.body,
							from: process.env.FROM_EMAIL,
							userId: delivery.user_id,
							unsubscribeToken // Pass the token to the send function
						});

						// Update delivery status to sent and store unsubscribe token
						await EmailArchive.updateDeliveryStatus({
							deliveryId: delivery.id,
							status: 'sent',
							unsubscribeToken
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

		// Remove duplicates (based on email address)
		recipients = [...new Set(recipients.map(r => JSON.stringify(r)))].map(r => JSON.parse(r));

		// Create email archive entry
		const emailArchive = await EmailArchive.create({
			subject,
			body: emailBody,
			recipientType,
			recipientCount: recipients.length,
			sentBy: userId
		});
		
		console.log('Created email archive:', emailArchive);  // Debug log

		// Track delivery status for each recipient
		const deliveryResults = await Promise.allSettled(
			recipients.map(async (recipient) => {
				// Generate unsubscribe token if this is a user email
				const unsubscribeToken = recipient.id ? Mailgun.generateUnsubscribeToken(recipient.id, recipient.email) : null;

				// Create delivery record
				const delivery = await EmailArchive.createDelivery({
					emailArchiveId: emailArchive.id,
					recipient: recipient.email,
					unsubscribeToken,
					userId: recipient.id // Store the user ID if this is a user email
				});

				try {
					// Send email with userId for unsubscribe link if it's a user (not waitlist)
					await Mailgun.send({
						to: recipient.email,
						subject,
						text: emailBody,
						from: process.env.FROM_EMAIL,
						userId: recipient.id,
						unsubscribeToken // Pass the token to the send function
					});

					// Update delivery status to sent
					await EmailArchive.updateDeliveryStatus({
						deliveryId: delivery.id,
						status: 'sent'
					});

					return { success: true, recipient: recipient.email };
				} catch (error) {
					// Update delivery status to failed with error
					await EmailArchive.updateDeliveryStatus({
						deliveryId: delivery.id,
						status: 'failed',
						error: error.message
					});

					return { success: false, recipient: recipient.email, error: error.message };
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
