import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
	return {
		async create({ subject, body, recipientType, recipientCount, sentBy }) {
			const now = new Date().toISOString();
			try {
				const [email] = await db.create('email_archive', {
					subject,
					body,
					recipient_type: recipientType,
					recipient_count: recipientCount,
					sent_by: sentBy,
					sent_at: now
				});
				console.log('Successfully created email archive:', email);  // Debug log
				return email;
			} catch (error) {
				console.error('Failed to create email archive:', error);
				throw error;
			}
		},

		async createDelivery({ emailArchiveId, recipient }) {
			const now = new Date().toISOString();
			const [delivery] = await db.create('email_delivery', {
				email_archive_id: emailArchiveId,
				recipient,
				status: 'pending',
				sent_at: now,
				retry_count: 0
			});
			return delivery;
		},

		async updateDeliveryStatus({ deliveryId, status, error = null }) {
			const now = new Date().toISOString();
			
			if (status === 'failed') {
				const [[delivery]] = await db.query(
					'SELECT retry_count FROM email_delivery WHERE id = $deliveryId',
					{ deliveryId }
				);
				const retry_count = delivery.retry_count + 1;

				// Only include error and last_retry_at fields if needed
				const updateFields = {
					status,
					sent_at: now,
					retry_count
				};
				if (error) {
					updateFields.error = error;
				}
				if (retry_count > 1) {
					updateFields.last_retry_at = now;
				}

				const setClause = Object.keys(updateFields)
					.map(field => `${field} = $${field}`)
					.join(', ');

				await db.query(
					`UPDATE email_delivery 
					SET ${setClause}
					WHERE id = $deliveryId`,
					{ 
						...updateFields,
						deliveryId 
					}
				);
			} else {
				await db.query(
					`UPDATE email_delivery 
					SET status = $status, 
						sent_at = $sent_at 
					WHERE id = $deliveryId`,
					{ 
						status,
						sent_at: now,
						deliveryId 
					}
				);
			}
		},

		async getFailedDeliveries() {
			const [deliveries] = await db.query(
				'SELECT * FROM email_delivery WHERE status = $status ORDER BY sent_at DESC',
				{ status: 'failed' }
			);
			return deliveries;
		},

		async getFailedDeliveriesByEmailId(emailId) {
			const [deliveries] = await db.query(
				`SELECT 
					*,
					->email_archive_id.* AS email_archive
				FROM email_delivery
				WHERE status = $status 
				AND email_archive_id = $emailId 
				ORDER BY sent_at DESC`,
				{ status: 'failed', emailId }
			);
			return deliveries;
		},

		async getDeliveriesByEmailId(emailId) {
			const [deliveries] = await db.query(
				'SELECT * FROM email_delivery WHERE email_archive_id = $emailId ORDER BY sent_at DESC',
				{ emailId }
			);
			return deliveries;
		},

		async getAll() {
			const [emails] = await db.query(
				'SELECT * FROM email_archive ORDER BY sent_at DESC'
			);
			return emails;
		},

		async getAllUserEmails() {
			const [users] = await db.query('SELECT email FROM user');
			return users.map(user => user.email);
		},

		async getAllWaitlistEmails() {
			const [waitlist] = await db.query('SELECT email FROM waitlist');
			return waitlist.map(entry => entry.email);
		}
	};
};

export default {
	id: primary
};
