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

			results = (await res.json()).data;
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

	$: results;
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
			<div class="podcast-item">
				<img src={podcast.image} alt="" class="podcast-image" />
				<div class="podcast-content">
					<h4>
						<a href={podcast.url}>{podcast.title}</a>
					</h4>
					<div class="description">{podcast.description}</div>
					<!-- Additional metadata can go here -->
					<a
						href="#"
						on:click|preventDefault={() => {
							follow(podcast);
						}}>follow</a
					>
				</div>
			</div>
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
		list-style: none;
	}

	li:hover {
		background-color: var(--list-hover-background-color);
	}

	.podcast-item {
		display: flex;
		align-items: flex-start; /* Align items at the start vertically */
		margin-bottom: 1rem; /* Add spacing between list items */
	}

	.podcast-image {
		margin-right: 1rem; /* Space between the image and content */
		width: 100px; /* Set desired width */
		height: auto;
	}

	.podcast-content {
		flex: 1; /* Allow content to fill the remaining space */
	}

	.description {
		margin-top: 0.5rem; /* Space between title and description */
	}

	a {
		display: inline-block;
		margin-top: 0.5rem; /* Space above the follow link */
	}
</style>
