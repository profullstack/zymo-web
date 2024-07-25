<script>
	import { isExpanded } from '../modules/store.js';

	export let isLoggedIn, unverifiedUser;
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
	<div id="hamburger" on:click={toggleSidebar}>
		<img src="/static/images/hamburger.svg" alt="" />
	</div>

	<a href="/" id="logo"><img src="/static/logo.svg" alt="" /></a>
	<a href="/products">Products</a>
	{#if isLoggedIn || unverifiedUser}
		<a href="#" on:click={logout}>Logout</a>
	{:else}
		<a href="/login">Login</a>
		<a href="/register">Signup</a>
	{/if}
</nav>

<style>
	nav {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		background-color: var(--nav-background-color);
		padding: 0.8rem;
		margin: 0;
	}

	nav > * {
		margin: 0.4rem 0.4rem 0;
	}

	#hamburger {
		height: 100%;
	}
</style>
