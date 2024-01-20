<script>
	import SearchBar from './SearchBar.svelte';
	import Results from './Results.svelte';
</script>

<h1>GPU Prices</h1>

<div class="results">
	<SearchBar />
	<Results />
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
