<script>
	export let isLoggedIn, isAdmin;
</script>

<nav>
	<a href="/dashboard">Dashboard</a>
	<a href="/links">Create Link</a>
	<a href="/apikeys">Create API key</a>
	<a href="/dashboard/settings">Settings</a>
</nav>
<nav>
	<a href="/payment/history">Payment & Subscriptions</a>
	<a href="/appointment">Appointment</a>
	<a href="/affiliate">Affiliate Dashboard</a>
	{#if isAdmin}
		<a href="/admin">Admin</a>
	{/if}
</nav>
