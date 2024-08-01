<script>
	import { isExpanded } from '../modules/store.js';
	const navItems = [
		{
			route: '/m3u',
			name: 'Live TV',
			icon: 'livetv.svg'
		},
		{
			route: '/books',
			name: 'Books',
			icon: 'books.svg'
		},
		{
			route: '/music',
			name: 'Music',
			icon: 'music.svg'
		},
		{
			route: '/movies',
			name: 'Movies',
			icon: 'movies.svg'
		},
		{
			route: '/podcasts',
			name: 'Podcasts',
			icon: 'podcasts.svg'
		},
		{
			route: '/tv',
			name: 'TV',
			icon: 'tv.svg'
		}
	];
</script>

<nav id="sidebar" class:expanded={$isExpanded}>
	<ul>
		{#each navItems as item}
			<li>
				<a href={item.route}
					><img src="/static/icons/{item.icon}" alt="" border="0" />
					<strong>{item.name}</strong></a
				>
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
		overflow: hidden;
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

	@media (max-width: 600px) {
		#sidebar {
			width: 0;
		}

		#sidebar.expanded {
			width: 200px;
		}
	}
</style>
