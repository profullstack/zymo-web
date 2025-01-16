import { Store } from 'primate';

export default class EmailArchive extends Store {
	async create({ subject, body, recipientType, recipientCount, sentBy }) {
		const now = new Date().toISOString();
		const email = await this.db.create('email_archive', {
			subject,
			body,
			recipient_type: recipientType,
			recipient_count: recipientCount,
			sent_by: sentBy,
			sent_at: now
		});
		return email;
	}

	async createDelivery({ emailArchiveId, recipient }) {
		const now = new Date().toISOString();
		const delivery = await this.db.create('email_delivery', {
			email_archive_id: emailArchiveId,
			recipient,
			status: 'pending',
			sent_at: now,
			retry_count: 0
		});
		return delivery;
	}

	async updateDeliveryStatus({ deliveryId, status, error = null }) {
		const now = new Date().toISOString();
		const updates = {
			status,
			sent_at: now
		};
		
		if (status === 'failed') {
			updates.error = error;
			updates.retry_count = (await this.db.select('retry_count').from('email_delivery').where('id', '=', deliveryId))[0].retry_count + 1;
		}

		await this.db.update('email_delivery').set(updates).where('id', '=', deliveryId);
	}

	async getFailedDeliveries() {
		return await this.db.select()
			.from('email_delivery')
			.where('status', '=', 'failed')
			.order('sent_at', 'desc');
	}

	async getFailedDeliveriesByEmailId(emailId) {
		return await this.db.select('email_delivery.*, email_archive.*')
			.from('email_delivery')
			.join('email_archive', 'email_delivery.email_archive_id', '=', 'email_archive.id')
			.where({
				'email_delivery.status': 'failed',
				'email_delivery.email_archive_id': emailId
			})
			.order('email_delivery.sent_at', 'desc');
	}

	async getDeliveriesByEmailId(emailId) {
		return await this.db.select()
			.from('email_delivery')
			.where('email_archive_id', '=', emailId)
			.order('sent_at', 'desc');
	}

	async getAll() {
		return await this.db.select().from('email_archive').order('sent_at', 'desc');
	}

	async getAllUserEmails() {
		const users = await this.db.select('email').from('user');
		return users.map(user => user.email);
	}

	async getAllWaitlistEmails() {
		const waitlist = await this.db.select('email').from('waitlist');
		return waitlist.map(entry => entry.email);
	}
}
