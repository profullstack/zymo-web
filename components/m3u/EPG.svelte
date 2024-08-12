<script>
	import { onMount } from 'svelte';
	import { epgStore, setEPGData, setEPGError } from '../../modules/store.js';

	export let m3u = {};

	let currentTime = new Date();
	let endTime = new Date(currentTime).setHours(currentTime.getHours() + 24);

	let filterText = ''; // Reactive variable for filter input
	let currentPage = 1; // Current page for pagination
	const pageSize = 10; // Number of channels per page

	let filteredChannels = []; // Initialize filteredChannels as an empty array
	let paginatedChannels = []; // Initialize paginatedChannels as an empty array

	function generateTimeBlocks() {
		const blocks = [];
		const tempTime = new Date(currentTime);
		tempTime.setMinutes(0, 0, 0);

		while (tempTime <= endTime) {
			blocks.push(new Date(tempTime));
			tempTime.setHours(tempTime.getHours() + 1);
		}

		return blocks;
	}

	function calculateWidth(start, stop) {
		const duration = (stop - start) / (1000 * 60 * 60);
		const span = duration * 30;
		return span;
	}

	function formatTime(time) {
		return time.replace(
			/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}) ([+-]\d{2})(\d{2})/,
			'$1-$2-$3T$4:$5:$6$7:$8'
		);
	}

	function formatHour(time) {
		const hours = time.getHours();
		const minutes = time.getMinutes().toString().padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const formattedHours = hours % 12 || 12;
		return `${formattedHours}:${minutes} ${ampm}`;
	}

	async function fetchEPG() {
		try {
			const response = await fetch(`/api/m3u/${m3u.id}/epg`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const xmlText = await response.text();
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

			const xmlChannels = xmlDoc.querySelectorAll('channel');
			const xmlPrograms = xmlDoc.querySelectorAll('programme');

			let channels = [];

			Array.from(xmlChannels).forEach((channel) => {
				const id = channel.getAttribute('id');
				const name = channel.querySelector('display-name').textContent;
				const icon = channel.querySelector('icon')?.getAttribute('src');
				const programs = [];

				channels.push({
					id,
					name,
					icon,
					programs
				});
			});

			Array.from(xmlPrograms).forEach((program) => {
				const channelId = program.getAttribute('channel').trim();
				const channelIndex = channels.findIndex((channel) => channel.id === channelId);

				if (channelIndex > -1) {
					const title = program.querySelector('title').textContent;
					const start = new Date(formatTime(program.getAttribute('start')));
					const stop = new Date(formatTime(program.getAttribute('stop')));

					if (currentTime < stop && start < endTime) {
						channels[channelIndex].programs.push({
							title,
							start,
							stop
						});
					}
				}
			});

			channels = channels.filter((channel) => channel.programs.length > 0);

			setEPGData({ channels, timeBlocks: generateTimeBlocks() });
		} catch (err) {
			setEPGError(`Failed to fetch EPG data: ${err.message}`);
			console.error('Error fetching EPG data:', err);
		}
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

	onMount(() => {
		fetchEPG();
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
					<div class="channel-name">{channel.id}</div>
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
							title="{program.title} - {formatHour(program.start)}"
							class="program"
							style="min-width: {calculateWidth(program.start, program.stop)}rem;"
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
		max-width: 15rem;
		overflow: hidden;
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
