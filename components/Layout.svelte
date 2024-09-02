<script>
	import GlobalNavBar from './GlobalNavBar.svelte';
	import NavBar from './NavBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import MetaTags from './MetaTags.svelte';
	import Footer from './Footer.svelte';
	import { onMount } from 'svelte';
	import Player from './Player.svelte';

	export let isLoggedIn, unverifiedUser, isAdmin;
</script>

<MetaTags />

<GlobalNavBar {isLoggedIn} {unverifiedUser} {isAdmin} />

<main>
	<Sidebar {isLoggedIn} {unverifiedUser} />

	<div class="content">
		{#if isLoggedIn}
			<NavBar {isLoggedIn} {isAdmin} />
		{/if}

		<slot />
		<Footer />
	</div>
</main>

{#if isLoggedIn}
	<Player />
{/if}

<style>
	.content {
		width: 100%;
		padding: 1.2rem 2.4rem;
		margin-bottom: 20rem;
	}
</style>
