<script>
	export let isLoggedIn, unverifiedUser, isAdmin;
	
	// Get current page path for active state using browser location
	let currentPath = '';
	
	if (typeof window !== 'undefined') {
		currentPath = window.location.pathname;
	}
	
	function isActive(href) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<nav class="tabs">
	<a href="/dashboard" class:active={isActive('/dashboard')}>
		<img src="/icons/home.svg" alt="" />
		Dashboard
	</a>
	<a href="/live/new" class:active={isActive('/live')}>
		<img src="/icons/livetv.svg" alt="" />
		Create Live TV provider
	</a>
	<a href="/xtream/new" class:active={isActive('/xtream')}>
		<img src="/icons/streaming.svg" alt="" />
		Create Xtream Code provider
	</a>
	<a href="/library/new" class:active={isActive('/library')}>
		<img src="/icons/books.svg" alt="" />
		Create Library
	</a>
	<a href="/torrents/new" class:active={isActive('/torrents')}>
		<img src="/icons/torrent.svg" alt="" />
		Create Torrent Client
	</a>
	<a href="/apikeys" class:active={isActive('/apikeys')}>
		<img src="/icons/favicon.svg" alt="" />
		Create API key
	</a>
	<a href="/dashboard/settings" class:active={isActive('/dashboard/settings')}>
		<img src="/icons/favicon.svg" alt="" />
		Settings
	</a>
</nav>

<nav class="button-group">
	<a href="/payment/history" class:active={isActive('/payment')}>
		Payment & Subscriptions
	</a>
	<a href="/affiliate" class:active={isActive('/affiliate')}>
		Affiliate Dashboard
	</a>
	{#if isAdmin}
		<a href="/admin" class:active={isActive('/admin')}>
			Admin
		</a>
	{/if}
</nav>
