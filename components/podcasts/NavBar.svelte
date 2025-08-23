<script>
	let currentPath = '';
	
	if (typeof window !== 'undefined') {
		currentPath = window.location.pathname;
	}
	
	function isActive(href) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<nav class="tabs">
	<a href="/podcasts" class:active={isActive('/podcasts')}>
		<img src="/icons/podcasts.svg" alt="" />
		My Subscribed Podcasts
	</a>
	<a href="/podcasts/search" class:active={isActive('/podcasts/search')}>
		<img src="/icons/search.svg" alt="" />
		Search
	</a>
	<a href="/podcasters" class:active={isActive('/podcasters')}>
		<img src="/icons/podcasts.svg" alt="" />
		My Published Podcasts
	</a>
</nav>
