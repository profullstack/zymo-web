<script>
	let currentPath = '';
	
	if (typeof window !== 'undefined') {
		currentPath = window.location.pathname;
	}
	
	function isActive(href) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<nav class="sub-nav">
	<a href="/torrents/search" class:active={isActive('/torrents/search')}>
		<img src="/icons/search.svg" alt="" />
		Search
	</a>
</nav>
