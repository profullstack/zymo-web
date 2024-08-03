<script>
	export let isLoggedIn, unverifiedUser, isAdmin;
</script>

<nav>
	<a href="/dashboard">Dashboard</a>
	<a href="/m3u/new">Create M3U channel</a>
	<a href="/library/new">Create Library</a>
	<a href="/apikeys">Create API key</a>
</nav>
<nav>
	<a href="/payment/history">Payment & Subscriptions</a>
	<a href="/appointment">Appointment</a>
	<a href="/affiliate">Affiliate Dashboard</a>
	{#if isAdmin}
		<a href="/admin">Admin</a>
	{/if}
</nav>
