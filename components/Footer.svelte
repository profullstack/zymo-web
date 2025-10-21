<script>
	let appName = REPLACE_APP_NAME;
	let email = REPLACE_EMAIL;
	let appDomain = REPLACE_APP_DOMAIN;
</script>

<footer>
	<small>
		<a href="https://discord.gg/w5nHdzpQ29">Discord</a>
		<a href="https://github.com/profullstack/zymo-web">GitHub</a>
		<a href="mailto:{email}?subject={appName}">{email}</a>
		<a href="/terms">Terms</a>
		<a href="/privacy">Privacy</a> © 2023-2025
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
