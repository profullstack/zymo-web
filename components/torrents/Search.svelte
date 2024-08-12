<script>
	import Spinner from '../Spinner.svelte';
	let results = [];
	let q = '';
	let isLoading = false;
	let path;
	let mediaType;

	async function searchTorrents() {
		isLoading = true;
		try {
			const res = await fetch(
				'/api/torrent/search?q=' + encodeURIComponent(q) + '&mediaType=' + mediaType
				// '/api/torrent/search?q=' + encodeURIComponent(q)
			);

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

	async function download(torrent) {
		console.log(torrent);

		try {
			const res = await fetch('/api/torrent/download', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...torrent,
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
	<div class="field">
		<label
			><input type="radio" name="mediaType" value="Movies" bind:group={mediaType} /> Movies</label
		>
		<label
			><input type="radio" name="mediaType" value="Music" bind:group={mediaType} /> Music</label
		>
		<label><input type="radio" name="mediaType" value="TV" bind:group={mediaType} /> TV</label>
		<label
			><input type="radio" name="mediaType" value="Apps" bind:group={mediaType} /> Apps</label
		>
		<!-- <label
			><input type="radio" name="mediaType" value="Books" bind:group={mediaType} /> Books</label
		> -->
		<label><input type="radio" name="mediaType" value="XXX" bind:group={mediaType} /> XXX</label
		>
		<label
			><input type="radio" name="mediaType" value="Other" bind:group={mediaType} /> Other</label
		>
	</div>

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
			{torrent.title} seeders: {torrent.seeds} leechers: {torrent.peers} provider: {torrent.provider}
			<a
				href="#"
				on:click|preventDefault={() => {
					download(torrent);
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
		margin: 0 0.4rem;
	}
</style>
