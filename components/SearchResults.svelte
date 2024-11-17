<script>
	import { onMount } from 'svelte';
	import { streamUrl, selectedChannel, proxyStore, transcodeStore } from '../modules/store.js';
	import Play from './Play.svelte';
	import VideoPlayer from './VideoPlayer.svelte';
	import Spinner from './Spinner.svelte';
	export let q = '';
	let data = {};
	let msg = '';
	let isLoading = false;

	async function search(q) {
		if (!q) return;

		isLoading = true;

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
		} finally {
			isLoading = false;
		}
	}

	function playChannel(channel) {
		selectedChannel.set(channel);
		streamUrl.set(channel.url);
		proxyStore.set(false);
		transcodeStore.set(true);
		// window.history.pushState({}, '', '/play');
		// window.location.href = '/play';
	}

	onMount(async () => {
		data = await search(q);
	});
</script>

{#if q}
	<h1>Search Results for "{q}" {#if isLoading}<Spinner />{/if}</h1>
{/if}

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
										<li>
											<a
												href="#"
												on:click|preventDefault={() => playChannel(channel)}
												>{channel.name}</a
											>
										</li>
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

{#if $selectedChannel}
	<h2>{$selectedChannel.name}</h2>
	<VideoPlayer channel={$selectedChannel} />
{/if}

<style>
	h1 {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

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
		margin-left: 1.2rem;
	}
</style>
