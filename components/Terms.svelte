<script>
	const phone = REPLACE_PHONE;
	const email = REPLACE_EMAIL;
	const appName = REPLACE_APP_NAME;
</script>

<svelte:head>
	<title>Terms</title>
</svelte:head>

<section>
	<h1>Terms of Service for {appName}</h1>

	<p>Last updated: [Date]</p>

	<h2>1. Agreement to Terms</h2>
	<p>
		By accessing and using {appName}, you agree to comply with and be bound by these Terms of
		Service. If you disagree with any part of these terms, please do not use our service.
	</p>

	<h2>2. Changes to Terms</h2>
	<p>
		{appName} reserves the right to change, modify, or revise these Terms at any time. It is your
		responsibility to review these Terms periodically for any changes. Your continued use of the
		service signifies your acceptance of our updated Terms.
	</p>

	<h2>3. User Responsibilities</h2>
	<p>As a user of {appName}, you agree not to:</p>
	<ul>
		<li>Use the service for any illegal activities.</li>
		<li>Violate any local, state, or federal regulations or laws.</li>
		<li>Harass, abuse, or harm another person or group.</li>
	</ul>

	<h2>4. Termination</h2>
	<p>
		We may terminate or suspend your account at our sole discretion, without notice, for conduct
		that we believe violates these Terms or is harmful to other users of
		{appName}, us, or
		third parties, or for any other reason.
	</p>

	<h2>5. Limitation of Liability</h2>
	<p>
		To the fullest extent permitted by applicable law, {appName} shall not be liable for any indirect,
		incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
		whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible
		losses.
	</p>

	<h2>6. Governing Law</h2>
	<p>
		These Terms shall be governed by the laws of the [Country], without respect to its conflict
		of laws principles.
	</p>

	<h2>7. Contact Us</h2>
	<p>If you have any questions about these Terms of Service, please contact us:</p>
	<ul>
		<li>By email: {email}</li>
		<li>By phone: {phone}</li>
	</ul>
</section>

<style>
	section {
		max-width: 80vw;
		margin: 0 auto;
	}
</style>
