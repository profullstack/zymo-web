<script>
	import { onMount, afterUpdate } from 'svelte';
	import { epgStore, setEPGData, setEPGError } from '../../modules/store.js';

	let currentTime = new Date();
	let endTime = new Date(currentTime);
	endTime.setHours(currentTime.getHours() + 24);

	let filterText = ''; // Reactive variable for filter input

	function generateTimeBlocks() {
		console.log('Generating time blocks...');
		const blocks = [];
		const tempTime = new Date(currentTime);
		while (tempTime <= endTime) {
			blocks.push(new Date(tempTime));
			tempTime.setMinutes(tempTime.getMinutes() + 30);
		}
		console.log('Time blocks generated:', blocks);
		return blocks;
	}

	function calculateSpan(start, stop) {
		const duration = (stop - start) / (1000 * 60 * 30); // duration in 30-minute blocks
		console.log(`Calculating span: Start - ${start}, Stop - ${stop}, Duration - ${duration}`);
		return Math.ceil(duration);
	}

	async function fetchEPG() {
		try {
			console.log('Fetching EPG data...');
			const response = await fetch(
				'http://xtremity.tv:80/xmltv.php?username=a8nwVwmPu8&password=nKjvyCjMWc'
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const xmlText = await response.text();
			console.log('Fetched XML:', xmlText.substring(0, 200), '...'); // Log the first 200 characters
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

			const programs = xmlDoc.querySelectorAll('programme');
			const channelMap = {};
			console.log('Parsing programs...');

			Array.from(programs).forEach((program, index) => {
				const channel = program.getAttribute('channel');
				if (!channelMap[channel]) {
					channelMap[channel] = [];
				}
				const title = program.querySelector('title').textContent;
				const start = new Date(program.getAttribute('start'));
				const stop = new Date(program.getAttribute('stop'));

				console.log(
					`Program ${index}: Channel - ${channel}, Title - ${title}, Start - ${start}, Stop - ${stop}`
				);

				channelMap[channel].push({
					title,
					start,
					stop
				});
			});

			const channels = Object.keys(channelMap);
			const timeBlocks = generateTimeBlocks();

			console.log('Channels:', channels);
			console.log('EPG Data:', channelMap);
			console.log('Time Blocks:', timeBlocks);

			setEPGData({ channels, epgData: channelMap, timeBlocks });
			console.log('EPG data set in store.');
		} catch (err) {
			setEPGError(`Failed to fetch EPG data: ${err.message}`);
			console.error('Error fetching EPG data:', err);
		}
	}

	// Filter the channels based on the filter text
	$: filteredChannels = $epgStore.channels.filter((channel) =>
		channel.toLowerCase().includes(filterText.toLowerCase())
	);

	// Filter the EPG data based on the filtered channels
	$: filteredEPGData = {};
	if (filteredChannels.length > 0) {
		for (const channel of filteredChannels) {
			filteredEPGData[channel] = $epgStore.epgData[channel];
		}
	}

	onMount(() => {
		console.log('Component mounted, fetching EPG...');
		fetchEPG();
	});

	afterUpdate(() => {
		console.log('DOM has been updated');
		// Perform any operations you need to do after the DOM is updated
	});
</script>

<input type="text" bind:value={filterText} placeholder="Filter channels" />

{#if $epgStore.isLoading}
	<div>Loading EPG data...</div>
{:else if $epgStore.error}
	<div>{$epgStore.error}</div>
{:else if filterText.length >= 2}
	<!-- Only render when filter text has at least 2 characters -->
	<div class="epg-container">
		<div class="epg-channel-list">
			{#each filteredChannels as channel, index}
				<div class="epg-channel-name" key={index}>{channel}</div>
			{/each}
		</div>
		<div class="epg-schedule">
			{#each filteredChannels as channel, channelIndex}
				<ul class="epg-channel-schedule" key={channelIndex}>
					{#each $epgStore.timeBlocks as block, blockIndex}
						{#if filteredEPGData[channel]}
							{#each filteredEPGData[channel] as show, showIndex}
								{#if block >= show.start && block < show.stop}
									<li
										class="epg-show"
										style="grid-column: span {calculateSpan(
											show.start,
											show.stop
										)};"
										key={showIndex}
									>
										{show.title}
									</li>
								{/if}
							{/each}
						{/if}
					{/each}
				</ul>
			{/each}
		</div>
	</div>
{:else}
	<p>Please enter at least 2 characters to filter the channels.</p>
{/if}

<style>
	/* Same styles as before */
	.epg-container {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 1rem;
		overflow-x: auto;
	}

	.epg-channel-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.epg-channel-name {
		font-weight: bold;
		padding: 0.5rem;
		background-color: #333;
		color: white;
		border-radius: 5px;
		text-align: center;
	}

	.epg-schedule {
		display: grid;
		grid-template-columns: repeat(48, 1fr); /* 48 blocks for 30-min intervals */
		gap: 0.5rem;
	}

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
	}
</style>
