<script>
	import NavBar from './torrents/NavBar.svelte';
	export let clients = [];
</script>

<NavBar />

<h1>Torrent clients</h1>

<ul>
	{#each clients as client}
		<li>{client.name} - {client.url} <a href="/torrents/clients/{client.id}">edit</a></li>
	{/each}
</ul>
