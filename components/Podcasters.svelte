<script>
	import NavBar from './podcasters/NavBar.svelte';
	export let podcasters = [];
</script>

<NavBar />

<h1>Podcasters</h1>

<ul>
	{#each podcasters as podcast}
		<li>{podcast.name} - {podcast.url} <a href="/podcasters/show/{podcast.id}">show</a></li>
	{/each}
</ul>
