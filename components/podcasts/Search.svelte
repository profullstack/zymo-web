<script>
	import Spinner from '../Spinner.svelte';
	let results = [];
	let q = '';
	let isLoading = false;

	async function searchPodcasts() {
		isLoading = true;
		try {
			const res = await fetch('/api/podcasts/search?q=' + encodeURIComponent(q));

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

	async function follow(podcast) {
		console.log(podcast);

		try {
			const res = await fetch('/api/podcasts/follow', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(podcast)
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const data = await res.json();

			console.log(data);
		} catch (err) {
			console.error('Follow failed:', err);
		}
	}
</script>

<h1>Podcast search</h1>

<form on:submit|preventDefault={searchPodcasts}>
	<label for="q">Search:</label>
	<input type="text" bind:value={q} placeholder="ie: Joe Rogan" id="q" />

	<button>Search</button>
	{#if isLoading}
		<Spinner color="#672ad6" />
	{/if}
</form>

<ul>
	{#each results as podcast}
		<li>
			{podcast.name}

			<a
				href="#"
				on:click|preventDefault={() => {
					follow(podcast);
				}}>follow</a
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

	li {
		margin-left: 4rem;
	}

	li:hover {
		background-color: var(--list-hover-background-color);
	}
</style>
