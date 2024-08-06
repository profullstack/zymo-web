<script>
	import GlobalNavBar from './GlobalNavBar.svelte';
	import NavBar from './NavBar.svelte';
	import MetaTags from './MetaTags.svelte';
	import Footer from './Footer.svelte';

	export let isLoggedIn, unverifiedUser, isAdmin;
</script>
<MetaTags />
<main>
	<GlobalNavBar {isLoggedIn} {unverifiedUser} />

	{#if isLoggedIn}
		<NavBar {isLoggedIn} {isAdmin} />
	{/if}
	<slot />
	<Footer />
</main>
