<script>
	import { onMount } from 'svelte';

	export let q = '';
	let data = {};
	let msg = '';

	async function search(q) {
		if (!q) return;

		try {
			const res = await fetch('/api/search?q=' + encodeURIComponent(q), {
				method: 'GET'
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
	{#each Object.entries(data.results) as [category, items]}
		<div class="result">
			<h2>{category}</h2>
			{#if items.length > 0}
				<ul>
					{#each items as item}
						<li>
							<h3>{item.provider.name}</h3>
							<ul class="channel-list">
								{#each item.channels as channel}
									<li>{channel.name}</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No items found in this category.</p>
			{/if}
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

	.channel-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-left: 1.2rem
	}
</style>
