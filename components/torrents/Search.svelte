<script>
	export let results = [];

	async function download(torrent) {
		
	}
</script>

<h1>Torrent search</h1>

<ul>
	{#each results as torrent}
		<li>
			{torrent.title} - {torrent.magnet}
			<a
				href="#"
				on:click|preventDefault={() => {
					download(torrent);
				}}>download</a
			>
		</li>
	{/each}
</ul>

<style></style>
