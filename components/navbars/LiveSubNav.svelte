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
    <a href="/live" class:active={isActive('/live')}>
		<img src="/icons/livetv.svg" alt="" />
		M3U Player
	</a>
    <a href="/xtream" class:active={isActive('/xtream')}>
		<img src="/icons/streaming.svg" alt="" />
		Xtream Codes
	</a>
</nav>