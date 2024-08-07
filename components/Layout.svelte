<script>
	import GlobalNavBar from './GlobalNavBar.svelte';
	import NavBar from './NavBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import MetaTags from './MetaTags.svelte';
	import Footer from './Footer.svelte';
	import { onMount } from 'svelte';

	export let isLoggedIn, unverifiedUser, isAdmin;
	let audioUrl = 'https://files.h4kr.com/music/AC%E2%A7%B8DC/%2774%20Jailbreak/086-Jailbreak.mp3';
</script>

<MetaTags />

<GlobalNavBar {isLoggedIn} {unverifiedUser} {isAdmin} />
<main>
	<Sidebar {isLoggedIn} {unverifiedUser} />

	<div class="content">
		{#if isLoggedIn}
			<NavBar {isLoggedIn} {isAdmin} />
		{/if}
		<audio controls src={audioUrl}></audio>
		<slot />
	</div>
</main>

<style>
	.content {
		padding: 1.2rem 2.4rem;
	}
</style>
