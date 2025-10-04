<!-- VideoPlayer.svelte -->

<script>
	import { onMount, afterUpdate } from 'svelte';
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
	
	// Check if URL is a browser-native format
	function isWebSafeFormat(url) {
		const webSafeExtensions = ['.m3u8', '.mp4', '.webm', '.ogg', '.m3u'];
		return webSafeExtensions.some(ext => url.toLowerCase().includes(ext));
	}
	
	// Auto-enable transcode for non-web-safe formats
	let transcode = !isWebSafeFormat(channel.url);
	
	// Auto-enable proxy for http:// URLs (not https://), but disable if transcoding
	// Transcoding acts as a proxy itself
	let proxy = transcode ? false : (channel.url.startsWith('http://') && !channel.url.startsWith('https://'));
	
	// Update stores to match the auto-detected values
	proxyStore.set(proxy);
	transcodeStore.set(transcode);

	function handleProxyChange(event) {
		const proxy = event.target.checked;
		proxyStore.set(proxy);
		// Don't reload automatically - user will click reload button
	}

	function handleTranscodeChange(event) {
		const transcode = event.target.checked;
		transcodeStore.set(transcode);
		// Don't reload automatically - user will click reload button
	}
	
	function handleReload() {
		const channelObj = channel || get(selectedChannel);
		if (channelObj?.url) {
			playChannel(channelObj.url);
		}
	}

	async function playChannel(channelUrl) {
		if (!videoRef) return;
		
		// Clean up previous HLS instance to prevent race conditions
		if (hlsInstance) {
			console.log('Destroying previous HLS instance');
			hlsInstance.destroy();
			hlsInstance = null;
		}
		
		const proxyEnabled = get(proxyStore);
		const transcodeEnabled = get(transcodeStore);
		
		console.log('=== VideoPlayer playChannel ===');
		console.log('Channel URL:', channelUrl);
		console.log('Proxy enabled:', proxyEnabled);
		console.log('Transcode enabled:', transcodeEnabled);
		console.log('===============================');
		
		if (transcodeEnabled) {
			await transcodeMedia(channelUrl, videoRef);
		} else {
			hlsInstance = await playHLSStream(channelUrl, videoRef, proxyEnabled);
		}
	}

	let lastChannelUrl = null;

	onMount(async () => {
		const channelObj = channel || get(selectedChannel);
		if (channelObj?.url) {
			lastChannelUrl = channelObj.url;
			await playChannel(channelObj.url);
		}
	});

	// React to channel changes (only when URL actually changes)
	$: if (channel?.url && videoRef && channel.url !== lastChannelUrl) {
		lastChannelUrl = channel.url;
		playChannel(channel.url);
	}

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
	<button on:click={handleReload}>Reload Stream</button>
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
