<script>
	import { isExpanded } from '../modules/store.js';

	export let isLoggedIn, unverifiedUser, isAdmin;

	const home = '/';

	let q = '';

	function toggleSidebar(e) {
		e.preventDefault();

		isExpanded.update((value) => !value);
	}

	function doSearch() {
		// redirect to /search/results?q=searchTerm
		window.location.href = `/search/results?q=${q}`;
	}

	async function logout(e) {
		e.preventDefault();

		console.log('logout');

		try {
			await fetch('/logout', {
				method: 'POST'
			});

			return (window.location = home);
		} catch (err) {
			console.error(err);
		}
	}
</script>

<nav>
	<span>
		<a href="#" id="hamburger" on:click={toggleSidebar}>
			<img src="/images/hamburger.svg" alt="" />
		</a>
		<a href="/" id="logo"><img src="/logo.svg" alt="" /></a>
	</span>
	<form class="search" action="/search/results" method="GET">
		<input type="text" name="q" placeholder="Search" bind:value={q} />
		<button><img src="/icons/search.svg" alt="" /></button>
	</form>
	<span>
		<a href="/pricing">Pricing</a>
		{#if isLoggedIn || unverifiedUser}
			<a href="/dashboard">Dashboard</a>
			{#if isAdmin}
				<a href="/admin">Admin</a>
			{/if}
			<a href="#" on:click={logout}>Logout</a>
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Signup</a>
		{/if}
	</span>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--nav-background-color);
		padding: 0.4rem 0.8rem;
		border-width: 0 0 1px 0;
		border-style: solid;
		border-color: var(--nav-border-color);
		margin: 0;
	}

	nav > * {
		margin: 0.4rem 0.4rem 0;
	}

	nav span:first-child {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	nav :is(a, a:visited) {
		color: var(--global-nav-link-color);
		text-decoration: none;
		padding: 0.4rem;
	}
	#hamburger {
		height: 100%;
	}

	#logo {
		display: block;
		margin-left: 1.2rem;
	}

	#logo img {
		display: block;
		height: 5rem;
		width: auto;
		margin-left: 1.2rem;
		display: block;
		border: none;
	}

	.search {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.search input {
		width: 100%;
		padding: 0.4rem;
		border-radius: 1.2rem;
		border: 1px solid var(--nav-border-color);
	}

	.search button {
		background-color: var(--search-button-background-color);
		padding: 0.4rem;
		border-radius: 0 1.2rem 1.2rem 0;
		border: 1px solid var(--search-button-background-color);
	}
</style>
