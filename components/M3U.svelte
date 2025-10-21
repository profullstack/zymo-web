<script>
	import { onMount } from 'svelte';
	import Spinner from './Spinner.svelte';
	import AffliateLinks from './AffliateLinks.svelte';
	import LiveSubNav from './navbars/LiveSubNav.svelte';
	import {
		channels,
		filterValue,
		selectedChannel,
		selectedProvider,
		isLoading,
		isChannelListOpen,
		mp4,
		filteredChannels
	} from '../modules/store.js';
	import { fetchChannels, parseM3U8, selectChannel } from '../modules/player.js';
	import { searchM3UChannels } from '../modules/autocomplete.js';
	import VideoPlayer from './VideoPlayer.svelte';
	import { get } from 'svelte/store';

	export let m3us = [];

	let isChannelSearchHovered = false;
	let searchDebounceTimer = null;

	// Handle provider change event
	async function handleProviderChange(event) {
		const provider = event.target.value;
		if (provider && provider !== '-- Select Provider --') {
			selectedProvider.set(provider);
			await fetchChannels(provider);
		}
	}

	// Handle catalog reload
	async function handleCatalogReload() {
		const provider = get(selectedProvider);
		if (provider && provider !== '-- Select Provider --') {
			await fetchChannels(provider);
		}
	}

	// Perform the actual search
	async function performSearch(query, provider) {
		try {
			const results = await searchM3UChannels(provider, query, 20);
			filteredChannels.set(results);
			isChannelListOpen.set(true);
		} catch (error) {
			console.error('Search error:', error);
			filteredChannels.set([]);
		}
	}

	// Handle search input with debouncing
	function handleSearchInput(event) {
		const query = event.target.value;
		filterValue.set(query);

		// Clear any existing timer
		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		const currentProvider = get(selectedProvider);
		if (!currentProvider) {
			filteredChannels.set([]);
			return;
		}

		if (!query || query.length < 2) {
			filteredChannels.set([]);
			isChannelListOpen.set(false);
			return;
		}

		// Set a new timer to perform search after 300ms of no typing
		searchDebounceTimer = setTimeout(() => {
			performSearch(query, currentProvider);
		}, 600);
	}

	function closeChannelList() {
		isChannelSearchHovered = false;
		setTimeout(() => {
			if (!isChannelSearchHovered) isChannelListOpen.set(false);
		}, 100);
	}

	onMount(() => {
		isLoading.set(false); // Ensure spinner is not showing by default
	});
</script>

<div id="main-content">
	<LiveSubNav />
	<AffliateLinks />
	<div class="field">
		<strong>Filter:</strong>
		<label>
			<input
				type="checkbox"
				id="mp4"
				on:change={() => mp4.set(!get(mp4))}
				bind:checked={$mp4}
			/>
			TV Shows and Movies only
		</label>
	</div>

	<div style="display: flex; align-items: center; gap: 0.5rem;">
		<select on:change={handleProviderChange}>
			<option>-- Select Provider --</option>
			{#each m3us as provider}
				<option value={provider.id} selected={$selectedProvider === provider.id}>
					{provider.name}
				</option>
			{/each}
		</select>
		{#if $selectedProvider}
			<button class="reload-btn" on:click={handleCatalogReload}>Reload Catalog</button>
		{/if}
		{#if $isLoading}
			<Spinner color="#672ad6" />
		{/if}
	</div>

	{#if $selectedProvider}
		<h4><a href="/live/stream/{$selectedProvider}/epg">View EGP</a></h4>
	{/if}

	<h4>Select a Channel</h4>

	<div
		class="filter-container"
		on:mouseover={() => (isChannelSearchHovered = true)}
		on:mouseleave={() => closeChannelList()}
	>
		<input
			type="text"
			id="filter-input"
			placeholder="Type to filter channels..."
			bind:value={$filterValue}
			disabled={$isLoading}
			on:mouseover={(e) => {
				e.target == document.activeElement ? isChannelListOpen.set(true) : null;
			}}
			on:click={() => isChannelListOpen.set(true)}
			on:input={handleSearchInput}
		/>

		{#if $isChannelListOpen}
			<ul id="channel-list">
				{#each $filteredChannels as channel, index (index)}
					<li class="channel-item" on:click|preventDefault={() => selectChannel(channel)}>
						{channel.name}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if $selectedChannel}
		<h2>{$selectedChannel.name}</h2>
		<VideoPlayer channel={$selectedChannel} />
	{/if}
</div>

<style>
	.filter-container {
		position: relative;
		z-index: 2;
	}

	#channel-list {
		width: 100%;
		max-width: 60rem;
		list-style-type: none;
		padding: 0;
		margin: 0;
		overflow-y: auto;
		margin-bottom: 0;
		background-color: var(--list-background-color);
	}

	#channel-list li {
		display: flex;
		align-items: center;
		padding: 8px;
		cursor: pointer;
	}
	#channel-list li:hover {
		background-color: var(--list-hover-background-color);
	}

	#filter-input {
		margin-bottom: 1rem;
		max-width: 60rem;
		box-sizing: border-box;
	}

	#filter-input:disabled {
		background-color: #f5f5f5;
		color: #999;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.reload-btn {
		padding: 0.25rem 0.75rem;
		font-size: 0.875rem;
		cursor: pointer;
	}
</style>
