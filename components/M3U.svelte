<script>
	import { onMount } from 'svelte';
	import Spinner from './Spinner.svelte';
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
	import VideoPlayer from './VideoPlayer.svelte';
	import { get } from 'svelte/store';

	export let m3us = [];

	let isChannelSearchHovered = false;

	// Handle provider change event
	async function handleProviderChange(event) {
		const provider = event.target.value;
		if (provider !== '-- Select Provider --') {
			selectedProvider.set(provider);
			await fetchChannels(provider);
		}
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
	<p>
		Need an IPTV service? <a href="https://necroiptv.com/shop/aff.php?aff=990">Get one here!</a>
	</p>
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

	<div style="display: flex; align-items: center;">
		<select on:change={handleProviderChange}>
			<option>-- Select Provider --</option>
			{#each m3us as provider}
				<option value={provider.id} selected={$selectedProvider === provider.id}>
					{provider.name}
				</option>
			{/each}
		</select>
		<Spinner isLoading={$isLoading} />
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
			on:mouseover={(e) => {
				e.target == document.activeElement ? isChannelListOpen.set(true) : null;
			}}
			on:click={() => isChannelListOpen.set(true)}
			on:input={() => isChannelListOpen.set(true)}
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
		max-height: 30rem;
		overflow-y: auto;
		position: absolute;
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
</style>
