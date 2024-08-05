<script>
	export let clients = [];
</script>

<h1>Torrent clients</h1>

<ul>
	{#each clients as client}
		<li>{JSON.stringify(client, null, 2)}</li>
	{/each}
</ul>
