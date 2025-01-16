<script>
	export let emails = [];

	let subject = '';
	let emailBody = '';
	let recipientType = 'all_users';
	let sending = false;
	let error = null;

	const recipientOptions = [
		{ value: 'all_users', label: 'All Users' },
		{ value: 'all_waitlist', label: 'All Waitlist Subscribers' },
		{ value: 'both', label: 'Both Users and Waitlist' }
	];

	async function refreshEmails() {
		const response = await fetch('/api/admin/db/email');
		emails = await response.json();
	}

	async function sendEmail() {
		if (!subject || !emailBody) {
			error = 'Please fill in both subject and body';
			return;
		}

		sending = true;
		error = null;

		try {
			const response = await fetch('/admin/db/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subject, emailBody, recipientType })
			});

			const result = await response.json();
			if (result.success) {
				subject = '';
				emailBody = '';
				await refreshEmails();
			} else {
				error = 'Failed to send email';
			}
		} catch (e) {
			error = e.message;
		} finally {
			sending = false;
		}
	}
</script>

<div class="email-manager">
	<h2>Mass Email Manager</h2>

	<div class="email-form">
		<div class="form-group">
			<label for="subject">Subject</label>
			<input
				type="text"
				id="subject"
				bind:value={subject}
				placeholder="Enter email subject"
				required
				class="form-input"
			/>
		</div>

		<div class="form-group">
			<label for="emailBody">Email Body</label>
			<textarea
				id="emailBody"
				bind:value={emailBody}
				placeholder="Enter email content"
				rows="10"
				required
				class="form-input"
			></textarea>
		</div>

		<div class="form-group">
			<label for="recipients">Recipients</label>
			<select id="recipients" bind:value={recipientType} class="form-input">
				{#each recipientOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<button on:click={sendEmail} disabled={sending} class="btn-primary">
			{sending ? 'Sending...' : 'Send Email'}
		</button>
	</div>

	<div class="sent-emails">
		<h3>Sent Emails</h3>
		<table>
			<thead>
				<tr>
					<th>Date</th>
					<th>Subject</th>
					<th>Recipients</th>
					<th>Count</th>
				</tr>
			</thead>
			<tbody>
				{#each emails as email}
					<tr>
						<td>{new Date(email.sent_at).toLocaleString()}</td>
						<td>{email.subject}</td>
						<td>{email.recipient_type}</td>
						<td>{email.recipient_count}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.email-manager {
		padding: 20px;
		max-width: 800px;
		margin: 0 auto;
	}

	.email-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 40px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-input {
		padding: 8px 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
		width: 100%;
	}

	textarea.form-input {
		resize: vertical;
		min-height: 150px;
	}

	.btn-primary {
		background-color: #007bff;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
	}

	.btn-primary:hover {
		background-color: #0056b3;
	}

	.btn-primary:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	.error {
		color: #dc3545;
		margin: 10px 0;
		padding: 10px;
		border: 1px solid #dc3545;
		border-radius: 4px;
		background-color: #f8d7da;
	}

	.sent-emails {
		margin-top: 40px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 20px;
	}

	th,
	td {
		padding: 10px;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #f5f5f5;
		font-weight: 500;
	}

	tr:hover {
		background-color: #f8f9fa;
	}
</style>
