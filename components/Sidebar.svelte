<script>
	import { isExpanded } from '../modules/store.js';

	function toggleSidebar(e) {
		e.preventDefault();

		isExpanded.update((value) => !value);
	}

	function navigateTo(section) {
		alert('Navigate to ' + section);
	}
</script>

<div id="sidebar" class:expanded={$isExpanded}>
	<div class="menu-item" on:click={() => navigateTo('live-tv')}>
		<span>Live TV</span>
	</div>
	<div class="menu-item" on:click={() => navigateTo('books')}>
		<span>Books</span>
	</div>
	<div class="menu-item" on:click={() => navigateTo('music')}>
		<span>Music</span>
	</div>
	<div class="menu-item" on:click={() => navigateTo('movies')}>
		<span>Movies</span>
	</div>
	<div class="menu-item" on:click={() => navigateTo('podcasts')}>
		<span>Podcasts</span>
	</div>
	<div class="menu-item" on:click={() => navigateTo('tv')}>
		<span>TV</span>
	</div>
	<div class="toggle-btn" on:click={toggleSidebar}>&#9664;</div>
</div>

<style>
	.hidden {
		display: none;
	}

	#sidebar {
		height: 100vh;
		width: 60px;
		background-color: #7e7e7e;
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: width 0.3s;
		overflow: hidden;
	}

	#sidebar.expanded {
		width: 200px !important;
	}

	#sidebar .menu-item {
		color: #fff;
		text-align: center;
		padding: 20px 0;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	#sidebar .menu-item span {
		display: none;
		margin-left: 10px;
	}
	#sidebar.expanded .menu-item span {
		display: inline;
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
