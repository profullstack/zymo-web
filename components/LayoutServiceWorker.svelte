<script>
	import GlobalNavBar from './GlobalNavBar.svelte';
	import NavBar from './NavBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import MetaTags from './MetaTags.svelte';
	import Footer from './Footer.svelte';
	import { onMount } from 'svelte';

	export let isLoggedIn, unverifiedUser, isAdmin;
	let hasServiceWorker = false;
	let audioUrl = '/086-Jailbreak.mp3';

	function playAudio() {
		console.log('play clicked');
		if (navigator.serviceWorker.controller) {
			console.log('controller1');

			navigator.serviceWorker.controller.postMessage({ action: 'play', url: audioUrl });
			console.log('Play message sent to Service Worker.');
		}
	}

	function stopAudio() {
		console.log('stop clicked');
		if (navigator.serviceWorker.controller) {
			console.log('controller2');
			navigator.serviceWorker.controller.postMessage({ action: 'stop' });
			console.log('Stop message sent to Service Worker.');
		}
	}

	onMount(async () => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then(function (registration) {
					console.log('Service Worker registered with scope:', registration.scope);
				})
				.catch(function (error) {
					console.error('Service Worker registration failed:', error);
				});

			navigator.serviceWorker.ready
				.then(function (registration) {
					console.log('A service worker is active:', registration.active);
				})
				.catch(function (error) {
					console.error('Service Worker ready failed:', error);
				});

			navigator.serviceWorker.ready
				.then(function (registration) {
					console.log('Service Worker is ready:', registration.active);
					if (navigator.serviceWorker.controller) {
						console.log('A service worker is controlling this page.');
					} else {
						console.log('No service worker is controlling this page.');
					}
				})
				.catch(console.error);
		}
	});
</script>

<MetaTags />

<GlobalNavBar {isLoggedIn} {unverifiedUser} {isAdmin} />
<main>
	<Sidebar {isLoggedIn} {unverifiedUser} />

	<div class="content">
		{#if isLoggedIn}
			<NavBar {isLoggedIn} {isAdmin} />
		{/if}
		<h1>Persistent Media Player</h1>
		<button on:click|preventDefault={playAudio}>Play</button>
		<button on:click|preventDefault={stopAudio}>Stop</button>
		<slot />
	</div>
</main>

<style>
	.content {
		padding: 1.2rem 2.4rem;
	}
</style>
