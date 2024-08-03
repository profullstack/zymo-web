<script>
	import { onMount } from 'svelte';
	import Hls from 'hls.js';
	import Spinner from './Spinner.svelte'; // Import Spinner component

	export let m3us = [];

	let FFmpeg;
	let fetchFile;
	let toBlobURL;
	let ffmpeg;
	let channels = [];
	let filteredChannels = [];
	let selectedChannel = '';
	let streamUrl = '';
	let selectedProvider = {};
	let isChannelListExpanded = false;
	let isLoading = false; // New state variable

	onMount(async () => {
		fetchFile = (await import('//cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js'))
			.fetchFile;
		toBlobURL = (await import('//cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js'))
			.toBlobURL;
		FFmpeg = (await import('//cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js'))
			.FFmpeg;
		ffmpeg = new FFmpeg({ log: true });
	});

	async function convertFormat(inputUrl, targetFormat) {
		console.log('converting:', inputUrl, targetFormat);
		const baseURL = '//cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/';
		try {
			await ffmpeg.load({
				workerURL: await toBlobURL(
					`//cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm//worker.js`,
					'text/javascript'
				)
			});
			const inputFileName = inputUrl.split('/').pop();
			const outputFileExt = targetFormat.startsWith('.')
				? targetFormat.slice(1)
				: targetFormat;
			const outputFileName = inputFileName.replace(/\.\w+$/, `.${outputFileExt}`);

			ffmpeg.FS('writeFile', inputFileName, await fetchFile(inputUrl));
			await ffmpeg.run('-i', inputFileName, '-c:v', 'libx264', '-c:a', 'aac', outputFileName);
			const data = ffmpeg.FS('readFile', outputFileName);

			const videoURL = URL.createObjectURL(
				new Blob([data.buffer], { type: `video/${outputFileExt}` })
			);

			console.log(videoUrl);
			return videoURL;
		} catch (error) {
			console.error('Error converting video:', error);
			return null;
		}
	}

	function filterChannels() {
		const filterValue = document.getElementById('filter-input').value.toLowerCase();
		filteredChannels = channels.filter((channel) =>
			channel.name.toLowerCase().includes(filterValue)
		);
	}

	async function fetchChannels(provider) {
		isLoading = true; // Start loading
		channels = filteredChannels = [];
		try {
			const response = await fetch(`/api/m3u/${provider}`);
			const m3u8Text = await response.text();
			channels = filteredChannels = parseM3U8(m3u8Text);
		} catch (error) {
			console.error('Error fetching channels:', error);
		}
		isLoading = false; // End loading
	}

	function parseM3U8(m3u8Text) {
		const lines = m3u8Text.split('\n');
		const channelList = [];
		let channel = {};

		lines.forEach((line) => {
			if (line.startsWith('#EXTINF')) {
				const name = line.split(',')[1];
				channel = { name: name.trim() };
			} else if (line.startsWith('http')) {
				channel.url = line;
				channelList.push(channel);
			}
		});

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
		url = url.indexOf('m3u8') > 0 || url.indexOf('mp4') > 0 ? url : `${url}.m3u8`;

		if (url.indexOf('neczmabfa') > 0) {
			if (url.indexOf('mp4') > 0 || url.indexOf('mkv') > 0) {
				url = await convertFormat(url, '.mp4');
			}
		}

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
	<div style="display: flex; align-items: center;">
		<select on:change={handleProviderChange}>
			<option>-- Select Provider --</option>
			{#each m3us as provider}
				<option value={provider.id} selected={selectedProvider.id === provider.id}
					>{provider.name}</option
				>
			{/each}
		</select>
		<Spinner {isLoading} />
	</div>

	<h4>Select a Channel</h4>

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
