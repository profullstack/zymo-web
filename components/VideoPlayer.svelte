<!-- VideoPlayer.svelte -->

<script>
	import { onMount } from 'svelte';
	import {
		playHLSStream,
		transcodeMedia,
		handleProxyCheckboxChange,
		handleTranscodeCheckboxChange,
		updateVideoSource
	} from '../modules/player.js';
	import { streamUrl, selectedChannel, proxyStore, transcodeStore } from '../modules/store.js';
	import { get } from 'svelte/store';

	export let channel;

	let videoRef;
	let proxy = Boolean(!channel.url.includes('https://')) || get(proxyStore);
	let transcode = Boolean(!channel.url.includes('m3u')) || get(transcodeStore);

	proxy = !transcode;

	function handleProxyChange(event) {
		handleProxyCheckboxChange(event, videoRef);
	}

	function handleTranscodeChange(event) {
		handleTranscodeCheckboxChange(event, videoRef);
	}

	onMount(async () => {
		const channelObj = channel || get(selectedChannel);
		const initialUrl = channelObj.url;

		if (get(transcodeStore)) {
			await transcodeMedia(initialUrl, videoRef);
		} else {
			await playHLSStream(initialUrl, videoRef, get(proxyStore));
		}
	});

	$: if ($streamUrl && videoRef) {
		updateVideoSource(videoRef, $streamUrl, 'mp4');
		if (videoRef.requestFullscreen) {
			videoRef.requestFullscreen();
		} else if (videoRef.mozRequestFullScreen) {
			videoRef.mozRequestFullScreen();
		} else if (videoRef.webkitRequestFullscreen) {
			videoRef.webkitRequestFullscreen();
		} else if (videoRef.msRequestFullscreen) {
			videoRef.msRequestFullscreen();
		}
	}
</script>

<div>
	<label>
		<input type="checkbox" on:change={handleProxyChange} bind:checked={proxy} /> Enable proxy
	</label>
	<label>
		<input type="checkbox" on:change={handleTranscodeChange} bind:checked={transcode} /> Transcode
	</label>
</div>
<video id="video" controls autoplay={Boolean($streamUrl)} bind:this={videoRef}>
	<source src={$streamUrl} type="video/mp4" />
</video>

<style>
	video {
		width: 50%;
		max-width: 80vw;
		height: auto;
	}
</style>
