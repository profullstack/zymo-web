<script>
	import { isExpanded } from '../modules/store.js';

	export let isLoggedIn, unverifiedUser, isAdmin;

	const home = '/';

	function toggleSidebar(e) {
		e.preventDefault();

		isExpanded.update((value) => !value);
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
			<img src="/static/images/hamburger.svg" alt="" />
		</a>
		<a href="/" id="logo"><img src="/static/logo.svg" alt="" /></a>
	</span>
	<span>
		<!-- <a href="/products">Products</a> -->
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
		height: 7rem;
		width: auto;
		margin-left: 1.2rem;
	}

	#logo img {
		width: 100%;
		height: auto;
		display: block;
		border: none;
	}
</style>
