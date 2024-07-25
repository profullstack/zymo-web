<script>
	import GlobalNavBar from './GlobalNavBar.svelte';
	// import NavBar from './NavBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import MetaTags from './MetaTags.svelte';

	export let isLoggedIn, unverifiedUser;
</script>

<MetaTags />

<GlobalNavBar {isLoggedIn} {unverifiedUser} />
<main>
	<Sidebar />
	<div class="content">
		<slot />
	</div>
</main>