<script>
	let appName = REPLACE_APP_NAME;
	let email = REPLACE_EMAIL;
	let appDomain = REPLACE_APP_DOMAIN;
</script>

<footer>
	<small>
		<a href="https://discord.gg/nxHgWJzTVy">Join our Discord</a>
		<a href="https://taskard.com/c/65596220-08bd-47f5-bef0-9bcd904380f4">Leave us feedback!</a>
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
		padding: 1.2rem;
	}

	footer small {
		margin-left: 1.2rem;
	}
</style>
