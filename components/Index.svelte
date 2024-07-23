<script>
	import { onMount } from 'svelte';
	import { isExpanded } from '../modules/store.js';
	import MetaTags from './MetaTags.svelte';
	import Hls from 'hls.js';

	let waitlistEmail = '';

	const apiKey = '00cd6d6968af4b2f9d86b0fc3d3d7cd5';
	const embyServerAddress = 'https://emby.h4kr.com';
	const userId = '43604e74508a49eb8abe8a8d36049b0d'; // Replace with actual userId
	const deviceId = generateUUID();
	let currentChannelName = '';
	let currentPlaySessionId = '';
	let filteredChannels = [];
	let isChannelListExpanded = false;

	onMount(async () => {
		document.addEventListener('DOMContentLoaded', function () {
			fetchChannels();
			document.getElementById('filter-input').addEventListener('input', filterChannels);
			document.getElementById('filter-input').addEventListener('focus', function () {
				document.getElementById('channel-list-container').classList.remove('hidden');
			});
		});
	});

	function toggleSidebar(e) {
		e.preventDefault();

		isExpanded.update((value) => !value);
	}

	function fetchChannels() {
		fetch(`${embyServerAddress}/emby/LiveTV/Channels?api_key=${apiKey}`)
			.then((response) => response.json())
			.then((data) => {
				const channelList = document.getElementById('channel-list');
				filteredChannels = data.Items;
				displayChannels(filteredChannels);
			})
			.catch((error) => console.error('Error fetching channels:', error));
	}

	function filterChannels() {
		const filterValue = document.getElementById('filter-input').value.toLowerCase();
		const filtered = filteredChannels.filter((channel) =>
			channel.Name.toLowerCase().includes(filterValue)
		);
		displayChannels(filtered);
	}

	function displayChannels(channels) {
		const channelList = document.getElementById('channel-list');
		channelList.innerHTML = '';

		channels.forEach((channel) => {
			const listItem = document.createElement('li');
			const logoUrl = `${embyServerAddress}/emby/Items/${channel.Id}/Images/Primary?api_key=${apiKey}`;
			listItem.innerHTML = `<span>${channel.Name}</span>`;
			listItem.dataset.name = channel.Name.toLowerCase();
			listItem.dataset.channelName = channel.Name;
			listItem.addEventListener('click', () => {
				startPlayback(channel.Id, channel.Name);
				document.getElementById('channel-list-container').classList.add('hidden'); // Close the dropdown
			});
			channelList.appendChild(listItem);
		});
	}

	function startPlayback(channelId, channelName) {
		isChannelListExpanded = false;
		stopCurrentPlayback();
		currentChannelName = channelName;
		updateCurrentChannel(channelId, channelName);
		fetchPlaySession(channelId)
			.then((playSessionInfo) => {
				currentPlaySessionId = playSessionInfo.PlaySessionId;
				return fetchPlaybackInfo(
					channelId,
					playSessionInfo.MediaSourceId,
					playSessionInfo.PlaySessionId
				);
			})
			.then((streamUrl) => playStream(streamUrl))
			.catch((error) => console.error('Error starting playback:', error));
	}

	function updateCurrentChannel(channelId, channelName) {
		const currentChannelElement = document.getElementById('current-channel');
		currentChannelElement.innerHTML = `<img src="${embyServerAddress}/emby/Items/${channelId}/Images/Primary?api_key=${apiKey}" alt="" style="width: auto; height: 50px; margin-right: 10px;"> ${channelName}`;
	}

	function stopCurrentPlayback() {
		if (currentPlaySessionId) {
			fetch(`${embyServerAddress}/emby/Sessions/Playing/Stopped`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Emby-Token': apiKey
				},
				body: JSON.stringify({
					PlaySessionId: currentPlaySessionId,
					PositionTicks: 0
				})
			})
				.then(() => {
					currentPlaySessionId = '';
				})
				.catch((error) => console.error('Error stopping playback:', error));
		}
	}

	function fetchPlaySession(channelId) {
		return fetch(
			`${embyServerAddress}/emby/Items/${channelId}/PlaybackInfo?UserId=${userId}&StartTimeTicks=0&IsPlayback=false&AutoOpenLiveStream=false&MaxStreamingBitrate=200000000&X-Emby-Client=Emby+Web&X-Emby-Device-Name=Firefox&X-Emby-Device-Id=${deviceId}&X-Emby-Client-Version=4.8.8.0&X-Emby-Token=${apiKey}&X-Emby-Language=en-us&reqformat=json`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					DeviceProfile: {
						MaxStaticBitrate: 140000000,
						MaxStreamingBitrate: 140000000,
						MusicStreamingTranscodingBitrate: 192000,
						DirectPlayProfiles: [],
						TranscodingProfiles: [
							{
								Container: 'ts',
								Type: 'Video',
								AudioCodec: 'aac',
								VideoCodec: 'h264',
								Context: 'Streaming',
								Protocol: 'hls',
								MaxAudioChannels: '2',
								MinSegments: '1',
								BreakOnNonKeyFrames: true,
								ManifestSubtitles: 'vtt'
							}
						],
						ContainerProfiles: [],
						CodecProfiles: [],
						SubtitleProfiles: [],
						ResponseProfiles: []
					}
				})
			}
		)
			.then((response) => response.json())
			.then((data) => {
				const mediaSourceId = data.MediaSources[0].Id;
				const playSessionId = data.PlaySessionId;
				return { MediaSourceId: mediaSourceId, PlaySessionId: playSessionId };
			});
	}

	function fetchPlaybackInfo(channelId, mediaSourceId, playSessionId) {
		return fetch(
			`${embyServerAddress}/emby/Items/${channelId}/PlaybackInfo?UserId=${userId}&StartTimeTicks=0&IsPlayback=true&AutoOpenLiveStream=true&AudioStreamIndex=-1&MediaSourceId=${mediaSourceId}&MaxStreamingBitrate=200000000&X-Emby-Client=Emby+Web&X-Emby-Device-Name=Firefox&X-Emby-Device-Id=${deviceId}&X-Emby-Client-Version=4.8.8.0&X-Emby-Token=${apiKey}&X-Emby-Language=en-us&reqformat=json`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					DeviceProfile: {
						MaxStaticBitrate: 5000000, // Lower the maximum static bitrate
						MaxStreamingBitrate: 5000000, // Lower the maximum streaming bitrate
						MusicStreamingTranscodingBitrate: 128000, // Lower the music streaming bitrate
						DirectPlayProfiles: [],
						TranscodingProfiles: [
							{
								Container: 'ts',
								Type: 'Video',
								AudioCodec: 'aac',
								VideoCodec: 'h264',
								Context: 'Streaming',
								Protocol: 'hls',
								MaxAudioChannels: '2',
								MinSegments: '1',
								BreakOnNonKeyFrames: true,
								ManifestSubtitles: 'vtt',
								MaxWidth: 640,
								MaxHeight: 360
							} // Limit the resolution
						],
						ContainerProfiles: [],
						CodecProfiles: [],
						SubtitleProfiles: [],
						ResponseProfiles: []
					}
				})
			}
		)
			.then((response) => response.json())
			.then((data) => {
				if (!data.MediaSources || data.MediaSources.length === 0) {
					throw new Error('No compatible streams available');
				}
				const transcodingUrl = data.MediaSources[0].TranscodingUrl;
				return `${embyServerAddress}${transcodingUrl}?api_key=${apiKey}`;
			});
	}

	function playStream(streamUrl) {
		const video = document.getElementById('video');
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(streamUrl);
			hls.attachMedia(video);
			hls.on(Hls.Events.MANIFEST_PARSED, function () {
				video.play();
			});
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = streamUrl;
			video.addEventListener('canplay', function () {
				video.play();
			});
		} else {
			console.error('This device does not support HLS.');
		}
	}

	function generateUUID() {
		var d = new Date().getTime();
		var d2 = (performance && performance.now && performance.now() * 1000) || 0;
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16;
			if (d > 0) {
				r = (d + r) % 16 | 0;
				d = Math.floor(d / 16);
			} else {
				r = (d2 + r) % 16 | 0;
				d2 = Math.floor(d2 / 16);
			}
			return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
		});
	}

	function isEmail(email) {
		var emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		if (email !== '' && email.match(emailFormat)) {
			return true;
		}

		return false;
	}
	async function joinWaitlist(e) {
		e.preventDefault();
		try {
			if (!waitlistEmail || !isEmail(waitlistEmail)) {
				alert('Please provide a valid email address');
				return;
			}

			const response = await fetch('/waitlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: waitlistEmail })
			});

			if (response.ok) {
				alert('Successfully subscribed to waitlist');
			} else {
				alert('Email already exists');
			}
		} catch (e) {}
	}

	const meta = {
		title: 'APP_NAME - APP_DESCRIPTION',
		description: 'APP_DESCRIPTION'
	};
</script>

<MetaTags {...meta} />

<div id="main-content" class:expanded={$isExpanded}>
	<div id="hamburger" on:click={toggleSidebar}>&#9776;</div>
	<h1>Live TV on watch.theater</h1>
	<input type="text" id="filter-input" placeholder="Type to filter channels..." />
	<div id="channel-list-container" class:hidden={isChannelListExpanded}>
		<ul id="channel-list">
			{#each filterChannels as channel}
				<li
					on:click={(channel) => {
						startPlayback(channel.Id, channel.Name);
					}}
				>
					{channel.Name}
				</li>
			{/each}
		</ul>
	</div>
	<h2 id="current-channel">Select a channel to play</h2>
	<video id="video" controls></video>
</div>

<h3>Join our waitlist</h3>

<form>
	<input bind:value={waitlistEmail} placeholder="Email address" />
	<br /><br />
	<button on:click={joinWaitlist}> Join now </button>
</form>

<style>
	#main-content {
		margin-left: 60px;
		padding: 20px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: margin-left 0.3s;
	}

	#main-content.expanded {
		margin-left: 200px;
	}

	#hamburger {
		display: none;
		position: fixed;
		top: 10px;
		left: 10px;
		font-size: 30px;
		cursor: pointer;
		z-index: 1000;
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
		#sidebar {
			width: 0;
			overflow: hidden;
		}
		#sidebar.expanded {
			width: 200px;
		}
		#main-content {
			margin-left: 0;
		}
		#main-content.expanded {
			margin-left: 200px;
		}
		#hamburger {
			display: block;
		}
		#channel-list-container {
			max-height: 200px;
		}

		video {
			width: 100%;
			height: auto;
		}
	}
</style>
