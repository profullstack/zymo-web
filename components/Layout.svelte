<script>
	// import GlobalNavBar from './GlobalNavBar.svelte';
	// import NavBar from './NavBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import MetaTags from './MetaTags.svelte';

	export let isLoggedIn, unverifiedUser;
</script>

<MetaTags />

<main>
	<Sidebar />
	<!-- <GlobalNavBar {isLoggedIn} {unverifiedUser} /> -->

	<!-- {#if isLoggedIn}
		<NavBar {isLoggedIn} />
	{/if} -->
	<slot />
</main>
