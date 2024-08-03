<script>
	import GlobalNavBar from './GlobalNavBar.svelte';
	import NavBar from './NavBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import MetaTags from './MetaTags.svelte';
	import Footer from './Footer.svelte';

	export let isLoggedIn, unverifiedUser, isAdmin;
</script>

<MetaTags />

<GlobalNavBar {isLoggedIn} {unverifiedUser} />
<main>
	<Sidebar {isLoggedIn} {unverifiedUser} />

	<div class="content">
		{#if isLoggedIn}
			<NavBar {isLoggedIn} {isAdmin} />
		{/if}
		<slot />
	</div>
</main>

<style>
	.content {
		padding: 1.2rem 2.4rem;
	}
</style>
