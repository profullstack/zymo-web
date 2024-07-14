<script>
	import GlobalNavBar from './GlobalNavBar.svelte';
	import NavBar from './NavBar.svelte';
	import MetaTags from './MetaTags.svelte';

	export let isLoggedIn, unverifiedUser;
</script>

<svelte:head>
	<MetaTags />
</svelte:head>

<main>
	<GlobalNavBar {isLoggedIn} {unverifiedUser} />

	{#if isLoggedIn}
		<NavBar {isLoggedIn} />
	{/if}
	<slot />
</main>
