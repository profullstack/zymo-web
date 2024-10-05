<script>
	import NavBar from './podcasts/NavBar.svelte';
	export let podcasts = [];
</script>

<NavBar />

<h1>Podcasts</h1>

<ul>
	{#each podcasts as podcast}
		<li>{podcast.name} - {podcast.url} <a href="/podcasts/show/{podcast.id}">show</a></li>
	{/each}
</ul>
