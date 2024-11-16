<script>
	import { onMount } from 'svelte';

	export let q = '';
	let data = {};
	let msg = '';

	async function search(q) {
		if (!q) return;

		try {
			const res = await fetch('/api/search', {
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(q)
			});

			if (!res.ok) {
				msg = 'failed query';
			}

			return await res.json();
		} catch (err) {
			console.error(err);
			msg = err.message;
		}
	}
	onMount(async () => {
		data = await search(q);
	});
</script>

<h1>Search Results for "{q}"</h1>

{#if data.results}
	<div class="results">
		{#each data.results as result}
			<div class="result">
				<h3>{result.title}</h3>
			</div>
		{/each}
	</div>
{/if}

<style>
	.results {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.result {
		border: 1px solid var(--border-color);
		padding: 1rem;
	}
</style>
