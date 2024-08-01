<script>
	import { isExpanded } from '../modules/store.js';
</script>

<nav id="sidebar" class:expanded={$isExpanded}>
	<ul>
		<li class="menu-item">
			<a href="/m3u">Live TV</a>
		</li>
		<li class="menu-item">
			<a href="/books">Books</a>
		</li>
		<li class="menu-item">
			<a href="/music">Music</a>
		</li>
		<li class="menu-item">
			<a href="/movies">Movies</a>
		</li>
		<li class="menu-item">
			<a href="/podcasts">Podcasts</a>
		</li>
		<li class="menu-item">
			<a href="/tv">TV</a>
		</li>
	</ul>
</nav>

<style>
	#sidebar {
		height: calc(100vh - 43.75px);
		width: 60px;
		background-color: var(--nav-background-color);
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: width 0.3s;
		overflow: hidden;
	}

	#sidebar.expanded {
		width: 200px !important;
	}

	#sidebar .menu-item a {
		color: #fff;
		text-align: center;
		padding: 20px 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	#sidebar .menu-item a {
		display: none;
		margin-left: 10px;
	}
	#sidebar.expanded .menu-item a {
		display: flex;
	}
	#sidebar .menu-item:hover {
		background-color: #575757;
	}
	#sidebar .toggle-btn {
		margin-top: auto;
		margin-bottom: 20px;
		cursor: pointer;
		color: #fff;
	}

	@media (max-width: 600px) {
		#sidebar {
			width: 0;
			overflow: hidden;
		}
		#sidebar.expanded {
			width: 200px;
		}
	}
</style>
