<script>
	import SearchBar from './SearchBar.svelte';
	import Results from './Results.svelte';

	export let results = [];

	async function search(event) {
		const search = event.detail;

		const res = await fetch('/prices', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(search)
		});

		if (res.ok) {
			results = await res.json();
		}
	}

	$: results;
</script>

<h1>GPU Prices</h1>

<div class="results">
	<SearchBar on:search={search} />
	<Results {results} />
</div>

<style>
	.results {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-direction: column;
	}

	@media screen and (min-width: 421px) {
		.results {
			flex-wrap: nowrap;
			flex-direction: row;
		}
	}
</style>
