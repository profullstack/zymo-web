<script>
	import Spinner from '../Spinner.svelte';
	let results = [];
	let q = '';
	let isLoading = false;
	let path;

	async function searchTorrents() {
		isLoading = true;
		try {
			const res = await fetch('/api/torrent/search?q=' + encodeURIComponent(q));

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			results = await res.json();
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	async function download(magnet) {
		console.log(magnet);
		try {
			const res = await fetch('/api/torrent/download', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					magnet,
					path
				})
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const data = await res.json();

			console.log(data);
		} catch (err) {
			console.error('Download failed:', err);
		}
	}
</script>

<h1>Torrent search</h1>

<form on:submit|preventDefault={searchTorrents}>
	<label for="q">Search:</label>
	<input type="text" bind:value={q} placeholder="ie: 1080" id="q" />
	<button>Search</button>
	<Spinner {isLoading} />
</form>

<form>
	<div class="field">
		<label>Download path:</label>
		<input type="text" name="path" bind:value={path} placeholder="ie: /movies" />
	</div>
</form>

<ul>
	{#each results as torrent}
		<li>
			{torrent.title}
			<a
				href="#"
				on:click|preventDefault={() => {
					download(torrent.magnet);
				}}>download</a
			>
		</li>
	{/each}
</ul>

<style>
	form {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin: 0.8rem 0;
	}

	form label {
		text-wrap: nowrap;
	}
</style>
