<script>
	import { onMount } from 'svelte';
	import { epgStore, setEPGData, setEPGError } from '../../modules/store.js';

	export let m3u = {};

	let currentTime = new Date();
	let endTime = new Date(currentTime);
	endTime.setHours(currentTime.getHours() + 24);

	let filterText = ''; // Reactive variable for filter input
	let currentPage = 1; // Current page for pagination
	const pageSize = 10; // Number of channels per page

	let filteredChannels = []; // Initialize filteredChannels as an empty array
	let paginatedChannels = []; // Initialize paginatedChannels as an empty array

	function generateTimeBlocks() {
		const blocks = [];
		const tempTime = new Date(currentTime);
		while (tempTime <= endTime) {
			blocks.push(new Date(tempTime));
			tempTime.setMinutes(tempTime.getMinutes() + 30);
		}
		return blocks;
	}

	function calculateSpan(start, stop) {
		const duration = (stop - start) / (1000 * 60 * 30); // duration in 30-minute blocks
		return Math.ceil(duration);
	}

	function formatTime(time) {
		return time.replace(
			/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}) ([+-]\d{2})(\d{2})/,
			'$1-$2-$3T$4:$5:$6$7:$8'
		);
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

			const programs = xmlDoc.querySelectorAll('programme');
			const channelMap = {};
			Array.from(programs).forEach((program) => {
				const channel = program.getAttribute('channel').trim();
				if (!channelMap[channel]) {
					channelMap[channel] = [];
				}
				const title = program.querySelector('title').textContent;
				const start = new Date(formatTime(program.getAttribute('start')));
				const stop = new Date(formatTime(program.getAttribute('stop')));

				channelMap[channel].push({
					title,
					start,
					stop
				});
			});

			const channels = Object.keys(channelMap);
			const timeBlocks = generateTimeBlocks();

			console.log('Fetched channels:', channels);
			console.log('Fetched EPG data:', channelMap);

			setEPGData({ channels, epgData: channelMap, timeBlocks });

			console.log('epgStore after setEPGData:', $epgStore);
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
			? channels.filter((channel) => channel.toLowerCase().includes(filterText.toLowerCase()))
			: [];

	// Paginate the filtered channels
	$: paginatedChannels =
		filteredChannels.length > 0 ? paginate(filteredChannels, pageSize, currentPage) : [];

	// Filter the EPG data based on the paginated channels
	$: filteredEPGData = {};

	function filterEPGData() {
		if (paginatedChannels.length > 0) {
			for (const channel of paginatedChannels) {
				const trimmedChannel = channel.trim();
				if ($epgStore.epgData[trimmedChannel]) {
					filteredEPGData[trimmedChannel] = $epgStore.epgData[trimmedChannel];
					console.log(
						`Data for channel ${trimmedChannel}:`,
						filteredEPGData[trimmedChannel]
					);
				} else {
					console.log(`No data found for channel ${trimmedChannel}`);
				}
			}
		}
	}

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

<input type="text" on:input={filterEPGData} bind:value={filterText} placeholder="Filter channels" />

{#if $epgStore.isLoading}
	<div>Loading EPG data...</div>
{:else if $epgStore.error}
	<div>{$epgStore.error}</div>
{:else if filterText.length >= 2}
	<!-- Only render when filter text has at least 2 characters -->
	<div class="epg-container">
		{#each paginatedChannels as channel, index}
			<div class="epg-row" key={index}>
				<div class="epg-channel-name">{channel}</div>
				<div class="epg-schedule">
					{#if filteredEPGData[channel] && filteredEPGData[channel].length > 0}
						{#each timeBlocks as block, blockIndex}
							{#if filteredEPGData[channel].some((show) => block >= show.start && block < show.stop)}
								{#each filteredEPGData[channel].filter((show) => block >= show.start && block < show.stop) as show}
									<div
										class="epg-show"
										style="grid-column: span {calculateSpan(
											show.start,
											show.stop
										)};"
									>
										{show.title}
									</div>
								{/each}
							{:else}
								<div class="epg-show-placeholder">No Show</div>
							{/if}
						{/each}
					{:else}
						<div class="epg-show-placeholder">No Data</div>
					{/if}
				</div>
			</div>
		{/each}
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

<!-- Dump data for debugging -->
{#if filteredChannels.length > 0}
	<pre>{JSON.stringify(filteredEPGData, null, 2)}</pre>
{/if}

<style>
	/* EPG Container */
	.epg-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow-x: auto;
	}

	/* EPG Row */
	.epg-row {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 1rem;
	}

	/* Channel Name */
	.epg-channel-name {
		font-weight: bold;
		padding: 0.5rem;
		background-color: #333;
		color: white;
		border-radius: 5px;
		text-align: center;
	}

	/* Schedule Grid */
	.epg-schedule {
		display: grid;
		grid-template-columns: repeat(48, 1fr); /* 48 blocks for 30-min intervals */
		gap: 0.5rem;
	}

	/* Show Block */
	.epg-show {
		background-color: #007bff;
		color: white;
		padding: 0.5rem;
		border-radius: 5px;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.epg-show-placeholder {
		background-color: #e0e0e0;
		height: 100%;
		text-align: center;
		line-height: 1.5rem;
	}

	/* Pagination Controls */
	.pagination-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 1rem;
	}

	.pagination-controls button {
		background-color: #333;
		color: white;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 5px;
		margin: 0 0.5rem;
		cursor: pointer;
	}

	.pagination-controls button:disabled {
		background-color: #666;
		cursor: not-allowed;
	}

	.pagination-controls span {
		font-weight: bold;
	}
</style>
