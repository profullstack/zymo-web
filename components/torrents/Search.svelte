<script>
	import Spinner from '../Spinner.svelte';
	let results = [];
	let q = '';
	let isLoading = false;
	let path;
	let mediaType;
	let sort = 'seeds';

	async function searchTorrents() {
		isLoading = true;
		try {
			const res = await fetch(
				'/api/torrent/search?q=' +
					encodeURIComponent(q) +
					'&mediaType=' +
					mediaType +
					'&sort=' +
					sort
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
	<div class="field">
		<label
			>Sort by: <select id="sort" bind:value={sort}>
				<option value="size">Size</option>
				<option value="seeds">Seeders</option>
				<option value="time">Time</option>
			</select></label
		>
	</div>

	<button>Search</button>
	<Spinner {isLoading} />
</form>

<form>
	<label>Download path:</label>
	<input type="text" name="path" bind:value={path} placeholder="ie: /movies" />
</form>

<ul>
	{#each results as provider}
		<li class="provider"><h2>{provider.provider}</h2></li>
		{#each provider.results as torrent}
			<li>
				{torrent.name} seeders: {torrent.seeders} leechers: {torrent.leechers} category: {torrent.category}
				size:
				{torrent.size}
				<a
					href="#"
					on:click|preventDefault={() => {
						download(torrent);
					}}>download</a
				>
			</li>
		{/each}
	{/each}
</ul>

<style>
	form {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin: 0.8rem 0;
	}

	.field {
		margin-bottom: 0;
	}

	select {
		margin-right: 0.8rem;
	}
	form label {
		text-wrap: nowrap;
		margin: 0 0.4rem;
	}

	li.provider {
		list-style-type: none;
		margin: 0.8rem 0;
	}

	li:not(.provider) {
		margin-left: 4rem;
	}

	li:not(.provider):hover {
		background-color: var(--list-hover-background-color);
	}
</style>
