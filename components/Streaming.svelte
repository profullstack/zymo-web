<script>
	let currentPath = '';
	
	if (typeof window !== 'undefined') {
		currentPath = window.location.pathname;
	}
	
	function isActive(href) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<h1>Streaming Accounts</h1>

<nav class="button-group">
	<a href="/streaming/mlb" class:active={isActive('/streaming/mlb')}>
		<img src="/icons/streaming.svg" alt="" />
		MLB.tv
	</a>
	<a href="/streaming/hulu" class:active={isActive('/streaming/hulu')}>
		<img src="/icons/streaming.svg" alt="" />
		Hulu
	</a>
	<a href="/streaming/nfl" class:active={isActive('/streaming/nfl')}>
		<img src="/icons/streaming.svg" alt="" />
		NFL+
	</a>
	<a href="/streaming/peacock" class:active={isActive('/streaming/peacock')}>
		<img src="/icons/streaming.svg" alt="" />
		Peacock
	</a>
	<a href="/streaming/disney" class:active={isActive('/streaming/disney')}>
		<img src="/icons/streaming.svg" alt="" />
		Disney Plus
	</a>
</nav>
