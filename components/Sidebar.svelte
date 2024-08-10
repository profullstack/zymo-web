<script>
	import { isExpanded, currentPath } from '../modules/store.js';

	const navItems = [
		{ route: '/', name: 'Home', icon: 'home.svg' },
		{ route: '/live', name: 'Live TV', icon: 'livetv.svg' },
		// { route: '/books', name: 'Books', icon: 'books.svg' },
		{ route: '/music', name: 'Music', icon: 'music.svg' },
		{ route: '/movies', name: 'Movies', icon: 'movies.svg' },
		// { route: '/podcasts', name: 'Podcasts', icon: 'podcasts.svg' },
		{ route: '/tv', name: 'TV', icon: 'tv.svg' },
		{ route: '/torrents', name: 'Torrents', icon: 'torrent.svg' }
		// { route: '/streaming', name: 'Streaming', icon: 'streaming.svg' }
	];

	function handleLinkClick(event) {
		event.preventDefault(); // Prevent default anchor behavior
		const url = event.currentTarget.getAttribute('href');
		// Update the store with the new path
		currentPath.set(url);

		isExpanded.set(false); // Close the sidebar
	}

	// Function to check if the link is active
	$: activeLink = (route) => {
		if (route === '/') {
			return $currentPath === '/';
		}
		return $currentPath.startsWith(route) && $currentPath !== '/';
	};
</script>

<nav id="sidebar" class:expanded={$isExpanded}>
	<ul>
		{#each navItems as item}
			<li>
				<a
					href={item.route}
					on:click={handleLinkClick}
					class:active={activeLink(item.route)}
				>
					<img src="/static/icons/{item.icon}" alt="" border="0" />
					<strong>{item.name}</strong>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	#sidebar {
		height: 100vh;
		width: 7rem;
		background-color: var(--nav-background-color);
		transition: width 0.3s;
		border-right: 1px solid var(--sidebar-border-color);
	}

	#sidebar ul {
		display: block;
		width: 100%;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	#sidebar li {
		display: block;
		width: 100%;
	}

	#sidebar.expanded {
		width: 18rem;
		overflow: initial;
	}

	#sidebar a {
		color: #fff;
		text-align: center;
		padding: 0.8rem 1em;
		margin: 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		cursor: pointer;
		text-decoration: none;
		font-weight: 400;
		font-size: 1.6rem;
		opacity: 0.7;
		text-align: left;
		box-sizing: border-box;
	}

	#sidebar a strong {
		display: none;
	}

	#sidebar img {
		display: block;
		width: 3rem;
		height: auto;
		padding: 0;
		margin: 0;
		flex-shrink: 0;
		transition: margin-left 0.3s; /* Transition effect for smooth expansion */
	}

	#sidebar.expanded a strong {
		display: block;
		text-wrap: nowrap;
		margin-left: 1.2rem;
	}

	#sidebar a:hover {
		opacity: 1;
	}

	#sidebar a.active {
		opacity: 1;
		background-color: var(--active-background-color); /* Custom active style */
	}

	@media (max-width: 600px) {
		#sidebar {
			width: 0;
			overflow: hidden;
		}
	}
</style>
