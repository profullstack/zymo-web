<script>
	let appName = REPLACE_APP_NAME;
	let email = REPLACE_EMAIL;
	let appDomain = REPLACE_APP_DOMAIN;
</script>

<footer>
	<small>
		<a href="https://taskard.com/c/65596220-08bd-47f5-bef0-9bcd904380f4">Give us feedback!</a>
		<a href="mailto:{email}?subject={appName}">{email}</a>
		<a href="/terms">Terms</a>
		<a href="/privacy">Privacy</a> © 2023-2024
		<a href="https://{appDomain}">{appName}</a>
	</small>
</footer>

<style>
	footer {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		border-top: 1px solid #ccc;
		padding: 1.2rem;
	}

	footer small {
		margin-left: 1.2rem;
	}
</style>
