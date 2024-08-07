<script>
	import Hls from 'hls.js';
	import { onMount } from 'svelte';
	import Spinner from './Spinner.svelte';

	export let m3us = [];
	export let proxy = false;
	let mp4 = false;

	let channels = [];
	let filteredChannels = [];
	let selectedChannel = '';
	let streamUrl = '';
	let selectedProvider = {};
	let isLoading = false;
	let filterValue = '';
	let isChannelListOpen = false;

	$: filterChannels();

	function filterChannels() {
		if (filterValue !== '') {
			filteredChannels = channels.filter((channel) =>
				channel.name.toLowerCase().includes(filterValue.toLowerCase())
			);
		} else {
			filteredChannels = channels;
		}
	}

	async function fetchChannels(provider) {
		isLoading = true;
		channels = [];
		filteredChannels = [];
		try {
			const response = await fetch(`/api/m3u/${provider}`);
			const m3u8Text = await response.text();
			channels = parseM3U8(m3u8Text);
			filterByType();
		} catch (error) {
			console.error('Error fetching channels:', error);
		} finally {
			isLoading = false;
		}
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
				channel.url = line.trim();
				channelList.push(channel);
			}
		});

		return channelList;
	}

	function selectChannel(channel) {
		isChannelListOpen = false;
		selectedChannel = channel;
		streamUrl = channel.url;
		playStream(streamUrl);
	}

	async function playStream(url) {
		url =
			url.indexOf('m3u8') > -1 ||
			url.indexOf('mp4') > -1 ||
			url.indexOf('mov') > -1 ||
			url.indexOf('mkv') > -1
				? url
				: `${url}.m3u8`;

		if (proxy) {
			url = `/proxy?url=${encodeURIComponent(url)}`;
		}

		const video = document.getElementById('video');
		video.muted = false; // Ensure the video is not muted
		video.volume = 1.0; // Ensure the volume is set to maximum

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

	function handleCheckboxChange(event) {
		proxy = event.target.checked;
		if (selectedChannel) {
			playStream(selectedChannel.url);
		}
	}

	function filterByType() {
		if (mp4) {
			filteredChannels = channels.filter((channel) => channel.url.endsWith('.mp4'));
		} else {
			filteredChannels = channels;
		}
	}

	onMount(() => {
		const checkbox = document.querySelector('#proxy-checkbox');
		if (proxy && checkbox) {
			checkbox.checked = true;
		}
	});
</script>

<div id="main-content">
	<div class="field">
		<strong>Filter:</strong>
		<label>
			<input type="checkbox" id="mp4" on:change={filterByType} bind:checked={mp4} />
			TV Shows and Movies only
		</label>
	</div>

	<div style="display: flex; align-items: center;">
		<select on:change={handleProviderChange}>
			<option>-- Select Provider --</option>
			{#each m3us as provider}
				<option value={provider.id} selected={selectedProvider.id === provider.id}>
					{provider.name}
				</option>
			{/each}
		</select>
		<Spinner {isLoading} />
	</div>

	<h4>Select a Channel</h4>

	<input
		type="text"
		id="filter-input"
		placeholder="Type to filter channels..."
		bind:value={filterValue}
		on:focus={() => (isChannelListOpen = true)}
		on:input={() => {
			isChannelListOpen = true;
			filterChannels();
		}}
	/>

	{#if isChannelListOpen}
		<ul id="channel-list">
			{#each filteredChannels as channel (channel.name)}
				<li class="channel-item" on:click|preventDefault={() => selectChannel(channel)}>
					{channel.name}
				</li>
			{/each}
		</ul>
	{/if}

	{#if selectedChannel}
		<h2>{selectedChannel.name}</h2>
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
		</div>
	{/if}

	{#if selectedChannel?.url?.indexOf('mp4') > -1}
		<video id="video" controls>
			<source src={selectedChannel.url} type="video/mp4" />
		</video>
	{:else}
		<button on:click={() => playStream(streamUrl)}>Play</button>
		<video id="video" controls></video>
	{/if}
</div>

<style>
	#channel-list {
		list-style-type: none;
		padding: 0;
		margin: 0;
		max-height: 30rem;
		overflow-y: auto;
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
		box-sizing: border-box;
	}
	video {
		width: 100%;
		height: auto;
	}
</style>
