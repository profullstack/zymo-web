<script>
	import Hls from 'hls.js';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import {
		epgStore,
		setEPGData,
		setEPGError,
		selectedChannel,
		streamUrl
	} from '../../modules/store.js';

	export let m3u = {};
	let playlist;
	let transcode = true;
	let proxy = false;
	let videoRef;
	let type = 'mp4';

	let currentTime = new Date();
	currentTime.setMinutes(0, 0, 0);

	let endTime = new Date(currentTime);
	endTime.setHours(currentTime.getHours() + 24);

	let filterText = ''; // Reactive variable for filter input
	let currentPage = 1; // Current page for pagination
	const pageSize = 10; // Number of channels per page

	let filteredChannels = []; // Initialize filteredChannels as an empty array
	let paginatedChannels = []; // Initialize paginatedChannels as an empty array

	// Function to handle checkbox change
	function handleTranscodeCheckboxChange(event) {
		transcode = event.target.checked;
		console.log('transcoding:', transcode);
		transcodeMedia($streamUrl);
	}

	function transcodeMedia(url) {
		url = `/api/transcode?url=${encodeURIComponent(url)}`;
		type = 'mp4';
		streamUrl.set(url);
		console.log(url);
		const source = videoRef.querySelector('source');
		source.src = $streamUrl;
		videoRef.load();
		console.log($streamUrl, '<< $streamUrl');
	}

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

	async function playHLSStream(url) {
		if (proxy) {
			url = `/proxy?url=${encodeURIComponent(url)}`;
		}

		const video = document.getElementById('video');
		video.muted = false;
		video.volume = 1.0;

		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(video);
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				video.play();
			});
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = url;
			video.addEventListener('loadedmetadata', () => {
				video.play();
			});
		} else {
			console.error('This device does not support HLS.');
		}
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
		time = new Date(time);
		const hours = time.getHours();
		const minutes = time.getMinutes().toString().padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const formattedHours = hours % 12 || 12;
		return `${formattedHours}:${minutes} ${ampm}`;
	}

	function removeEmptyChannels(channels) {
		return channels.filter((channel) => channel.programs.length > 0);
	}

	function fillMissingTime(channels) {
		channels.forEach((channel) => {
			const updatedPrograms = [];
			let previousStop = new Date(currentTime);
			previousStop.setSeconds(0, 0);

			let newEndTime = new Date(endTime);
			newEndTime.setHours(newEndTime.getHours() + 1);

			channel.programs.forEach((program) => {
				const programStart = new Date(program.start);
				const programStop = new Date(program.stop);
				programStart.setSeconds(0, 0);
				programStop.setSeconds(0, 0);

				if (previousStop < programStart) {
					updatedPrograms.push({
						title: 'empty',
						start: new Date(previousStop),
						stop: new Date(programStart),
						empty: true
					});
				}
				updatedPrograms.push({
					...program,
					start: programStart,
					stop: programStop
				});
				previousStop = programStop;
			});

			if (previousStop < newEndTime) {
				const end = new Date(newEndTime);
				end.setSeconds(0, 0);

				updatedPrograms.push({
					title: 'empty',
					start: previousStop,
					stop: end,
					empty: true
				});
			}

			channel.programs = updatedPrograms;
		});

		return channels;
	}

	async function fetchPlaylist() {
		try {
			const url = `/api/m3u/${m3u.id}`;
			const res = await fetch(url);

			if (res.ok) {
				return await res.text();
			}
		} catch (err) {
			console.error(err);
		}
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

					if (currentTime <= start && start <= endTime) {
						channels[channelIndex].programs.push({
							channelId,
							title,
							start,
							stop
						});
					}
				}
			});

			channels = removeEmptyChannels(channels);

			channels = fillMissingTime(channels);

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

	// Function to parse M3U8 content and extract channels
	function parseM3U8(m3u8Text) {
		const lines = m3u8Text.split('\n');
		const channelList = [];
		let channel = {};

		lines.forEach((line) => {
			if (line.startsWith('#EXTINF')) {
				const name = line.split(',')[1];
				const channelId = line.match(/tvg-id="([^"]*)"/)?.[1]?.trim();
				channel = { name: name.trim(), channelId };
			} else if (line.startsWith('http')) {
				channel.url = line.trim();
				channelList.push(channel);
			}
		});

		return channelList;
	}

	// Handle proxy checkbox change event
	function handleCheckboxChange(event) {
		proxy = event.target.checked;
		const channel = get(selectedChannel);
		if (channel) {
			playHLSStream(channel.url);
		}
	}

	function getChannelFromPlaylist(channelId) {
		return playlist.find((ch) => ch.channelId === channelId);
	}

	// Function to select a channel from the dropdown
	async function selectChannel(program) {
		console.log('clicked:', program);
		const m3u8Text = await fetchPlaylist(m3u.id);
		playlist = parseM3U8(m3u8Text);
		const { channelId } = program;
		const channel = getChannelFromPlaylist(channelId);

		console.log('got channel:', channel);
		selectedChannel.set(channel);
		streamUrl.set(channel.url);
		if (transcode) {
			transcodeMedia($streamUrl);
		} else {
			playHLSStream($streamUrl);
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
							on:click|preventDefault={async () => await selectChannel(program)}
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
	<div class="field">
		<label>
			<input
				type="checkbox"
				id="proxy-checkbox"
				on:change={handleCheckboxChange}
				bind:checked={proxy}
			/>
			Enable proxy
		</label>
		<label>
			<input
				type="checkbox"
				id="transcode-checkbox"
				on:change={handleTranscodeCheckboxChange}
				bind:checked={transcode}
			/>
			Transcode
		</label>
	</div>
{/if}

<video id="video" controls autoplay={Boolean($streamUrl)} bind:this={videoRef}>
	<source src={$streamUrl} type="video/{type}" />
</video>

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

	video {
		width: 50%;
		max-width: 80vw;
		height: auto;
	}
</style>
