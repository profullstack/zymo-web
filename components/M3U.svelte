<script>
	import { onMount } from 'svelte';
	import Hls from 'hls.js';
	// import { FFmpeg } from '@ffmpeg/ffmpeg';
	// import { fetchFile } from '@ffmpeg/util';

	export let m3us = [];
	// const ffmpeg = new FFmpeg();
	let channels = [];
	let filteredChannels = [];
	let selectedChannel = '';
	let streamUrl = '';
	let selectedProvider = {};
	let isChannelListExpanded = false;

	// async function convertFormat(inputUrl, targetFormat) {
	// 	console.log('converting:', inputUrl, targetFormat);
	// 	try {
	// 		await ffmpeg.load();

	// 		// Extract the file extension and name from the URL
	// 		const inputFileName = inputUrl.split('/').pop();
	// 		const outputFileExt = targetFormat.startsWith('.')
	// 			? targetFormat.slice(1)
	// 			: targetFormat;
	// 		const outputFileName = inputFileName.replace(/\.\w+$/, `.${outputFileExt}`);

	// 		// Fetch the file from the URL and write it to the ffmpeg virtual file system
	// 		// ffmpeg.FS('writeFile', inputFileName, await fetchFile(inputUrl));

	// 		// Execute the ffmpeg command to convert the file
	// 		await ffmpeg.run('-i', inputFileName, '-c:v', 'libx264', '-c:a', 'aac', outputFileName);

	// 		// Read the converted file from the ffmpeg file system
	// 		const data = ffmpeg.FS('readFile', outputFileName);

	// 		// Create a URL for the converted video
	// 		const videoURL = URL.createObjectURL(
	// 			new Blob([data.buffer], { type: `video/${outputFileExt}` })
	// 		);

	// 		console.log(videoUrl);
	// 		return videoURL;
	// 	} catch (error) {
	// 		console.error('Error converting video:', error);
	// 		return null;
	// 	}
	// }

	function filterChannels() {
		const filterValue = document.getElementById('filter-input').value.toLowerCase();

		filteredChannels = channels.filter((channel) =>
			channel.name.toLowerCase().includes(filterValue)
		);
	}
	async function fetchChannels(provider) {
		channels = filteredChannels = [];

		try {
			const response = await fetch(`/api/m3u/${provider}`);
			const m3u8Text = await response.text();
			channels = filteredChannels = parseM3U8(m3u8Text);
		} catch (error) {
			console.error('Error fetching channels:', error);
		}
	}

	function parseM3U8(m3u8Text) {
		const lines = m3u8Text.split('\n');
		const channelList = [];
		let channel = {};

		lines.forEach((line) => {
			console.log(line);
			if (line.startsWith('#EXTINF')) {
				const name = line.split(',')[1];
				console.log('name:', name);
				channel = { name: name.trim() };
			} else if (line.startsWith('http')) {
				console.log('url:', line);
				channel.url = line;
				channelList.push(channel);
			}
		});

		// console.log(channelList);
		filteredChannels = channelList;

		return channelList;
	}

	function selectChannel(channel) {
		isChannelListExpanded = false;

		selectedChannel = channel;
		streamUrl = channel.url;
		playStream(streamUrl);
	}

	async function playStream(url) {
		console.log('original play:', url);
		url = url.indexOf('m3u8') > 0 || url.indexOf('mp4') > 0 ? url : `${url}.m3u8`;

		if (url.indexOf('neczmabfa') > 0) {
			// Usage example:
			console.log('check redirect for:', url);
			let res = await fetch(url, { redirect: 'follow' });
			console.log('redirect at:', url);
			url = res.url;
			// url = await convertFormat(url, '.mp4');
		}

		console.log('play:', url);
		const video = document.getElementById('video');
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

	function handleProviderChange(event) {
		selectedProvider = event.target.value;
		fetchChannels(selectedProvider);
	}
</script>

<div id="main-content">
	<h1>Select a Channel Provider</h1>
	<select on:change={handleProviderChange}>
		<option>-- Select Provider --</option>
		{#each m3us as provider}
			<option value={provider.id} selected={selectedProvider.id === provider.id}
				>{provider.name}</option
			>
		{/each}
	</select>

	<h1>Select a Channel</h1>

	<input
		type="text"
		id="filter-input"
		placeholder="Type to filter channels..."
		on:input={filterChannels}
		on:focus={() => {
			isChannelListExpanded = true;
		}}
	/>
	<div id="channel-list-container" class:hidden={!isChannelListExpanded}>
		<ul id="channel-list">
			{#each filteredChannels as channel}
				<li
					on:click|preventDefault={() => {
						selectChannel(channel);
					}}
				>
					{channel.name}
				</li>
			{/each}
		</ul>
	</div>
	{#if selectedChannel}
		<h2>{selectedChannel.name}</h2>
	{/if}
	{#if selectedChannel?.url?.indexOf('mp4') > 0}
		<video id="video" controls>
			<source src={selectedChannel.url} type="video/mp4" />
		</video>
	{:else}
		<video id="video" controls></video>
	{/if}
</div>

<style>
	.hidden {
		display: none;
	}

	#channel-list-container {
		max-height: 300px;
		overflow-y: auto;
		border: 1px solid #ccc;
		margin-bottom: 20px;
		width: 100%;
		max-width: 600px;
	}
	#channel-list {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}
	#channel-list li {
		display: flex;
		align-items: center;
		padding: 8px;
		cursor: pointer;
	}

	#channel-list li:hover {
		background-color: #f0f0f0;
	}
	#filter-input {
		margin-bottom: 10px;
		padding: 5px;
		width: 100%;
		max-width: 600px;
		box-sizing: border-box;
	}
	#current-channel {
		margin-top: 20px;
		text-align: center;
	}
	video {
		width: 100%;
		max-width: 640px;
		height: auto;
	}
	@media (max-width: 600px) {
		#channel-list-container {
			max-height: 200px;
		}

		video {
			width: 100%;
			height: auto;
		}
	}
</style>
