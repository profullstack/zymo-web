<script>
	import { onMount } from 'svelte';
	import { epgStore, setEPGData, selectedChannel } from '../../modules/store.js';
	import { fetchEPG, selectChannelByProgram } from '../../modules/player.js';
	import VideoPlayer from '../VideoPlayer.svelte';

	export let m3u = {};

	let currentTime = new Date();
	currentTime.setMinutes(0, 0, 0);

	let endTime = new Date(currentTime);
	endTime.setHours(currentTime.getHours() + 24);

	let filterText = ''; // Reactive variable for filter input
	let currentPage = 1; // Current page for pagination
	const pageSize = 10; // Number of channels per page

	let filteredChannels = []; // Initialize filteredChannels as an empty array
	let paginatedChannels = []; // Initialize paginatedChannels as an empty array

	function calculateWidth(start, stop) {
		const duration = (stop - start) / (1000 * 60 * 60);
		const span = duration * 30;
		return span;
	}

	function formatHour(time) {
		time = new Date(time);
		const hours = time.getHours();
		const minutes = time.getMinutes().toString().padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const formattedHours = hours % 12 || 12;
		return `${formattedHours}:${minutes} ${ampm}`;
	}

	// Ensure $epgStore is defined and contains necessary data
	$: channels = $epgStore.channels || [];
	$: timeBlocks = $epgStore.timeBlocks || [];

	// Filter the channels based on the filter text
	$: filteredChannels =
		channels.length > 0
			? channels.filter((channel) =>
					channel.name.toLowerCase().includes(filterText.toLowerCase())
				)
			: [];

	// Paginate the filtered channels
	$: paginatedChannels =
		filteredChannels.length > 0 ? paginate(filteredChannels, pageSize, currentPage) : [];

	function paginate(array, page_size, page_number) {
		return array.slice((page_number - 1) * page_size, page_number * page_size);
	}

	function nextPage() {
		if (
			filteredChannels.length > 0 &&
			currentPage < Math.ceil(filteredChannels.length / pageSize)
		) {
			currentPage++;
		}
	}

	function prevPage() {
		if (filteredChannels.length > 0 && currentPage > 1) {
			currentPage--;
		}
	}

	onMount(async () => {
		await fetchEPG(m3u.id);
	});
</script>

<input type="text" id="filter-input" bind:value={filterText} placeholder="Filter channels" />

{#if $epgStore.isLoading}
	<div>Loading EPG data...</div>
{:else if $epgStore.error}
	<div>{$epgStore.error}</div>
{:else if filterText.length >= 2}
	<!-- Only render when filter text has at least 2 characters -->
	<div class="epg-container">
		<div class="channels-container">
			<div class="placeholder channel"></div>
			{#each paginatedChannels as channel}
				<div class="channel" title={channel.name}>
					<img class="channel-icon" src={channel.icon} />
					<div class="channel-name">{channel.name}</div>
				</div>
			{/each}
			<div class="placeholder channel"></div>
		</div>
		<div class="programs-container">
			<div class="placeholder time-list">
				{#each timeBlocks as time}
					<div class="time">{formatHour(time)}</div>
				{/each}
			</div>
			{#each paginatedChannels as channel}
				<div class="programs-list">
					{#each channel.programs as program}
						<div
							title="{program.title} - {formatHour(program.start)} to {formatHour(
								program.stop
							)}"
							class="program"
							style="min-width: {calculateWidth(
								program.start,
								program.stop
							)}rem; {program.empty ? 'background-color:gray;' : ''}"
							on:click|preventDefault={async () =>
								await selectChannelByProgram(program)}
						>
							{program.title}
						</div>
					{/each}
				</div>
			{/each}

			<div class="placeholder time-list">
				{#each timeBlocks as time}
					<div class="time">{formatHour(time)}</div>
				{/each}
			</div>
		</div>
	</div>
	<!-- Pagination controls -->
	<div class="pagination-controls">
		<button on:click={prevPage} disabled={currentPage === 1}>&lt;&lt;</button>
		<span>Page {currentPage} of {Math.ceil(filteredChannels.length / pageSize)}</span>
		<button
			on:click={nextPage}
			disabled={currentPage === Math.ceil(filteredChannels.length / pageSize)}
			>&gt;&gt;</button
		>
	</div>
{:else}
	<p>Please enter at least 2 characters to filter the channels.</p>
{/if}

{#if $selectedChannel}
	<h2>{$selectedChannel.name}</h2>
	<VideoPlayer channel={$selectedChannel} />
{/if}

<style>
	.epg-container {
		display: flex;
		gap: 2rem;
	}

	.channels-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.channel {
		height: 5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.channel-icon {
		height: 3rem;
		width: 3rem;
		border-radius: 50%;
		background-color: black;
	}

	.channel-name {
		max-width: 25rem;
		overflow: hidden;
		text-wrap: nowrap;
		text-overflow: ellipsis;
	}

	.programs-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		overflow-y: scroll;
	}

	.programs-list {
		display: flex;
		gap: 0.5rem;
		height: 5rem;
		align-items: center;
	}

	.program {
		background-color: var(--list-background-color);
		color: white;
		padding: 0.5rem;
		border-radius: 5px;
		text-align: center;
		white-space: nowrap;
		height: fit-content;
		overflow: hidden;
		text-overflow: ellipsis; /* Truncate text */
	}

	.program:hover {
		background-color: var(--list-hover-background-color);
	}

	.time-list {
		display: flex;
		gap: 0.5rem;
		height: 5rem;
		align-items: center;
	}

	.time {
		background-color: var(--list-hover-background-color);
		color: white;
		padding: 0.5rem;
		border-radius: 5px;
		text-align: center;
		white-space: nowrap;
		height: fit-content;
		min-width: 30rem;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
