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
	let hlsInstance = null; // Track HLS instance for cleanup
	let triedHttp = false; // Track if we've tried HTTP fallback
	
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
			triedHttp = false; // Reset fallback tracking
			playChannel(channelObj.url);
		}
	}

	async function playChannel(channelUrl) {
		if (!videoRef) return;
		
		// ALWAYS clean up previous HLS instance before any playback
		if (hlsInstance) {
			console.log('Destroying previous HLS instance');
			hlsInstance.destroy();
			hlsInstance = null;
		}
		
		// Also reset the video element to clean state
		videoRef.pause();
		videoRef.removeAttribute('src');
		videoRef.load();
		
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
			// Multi-step error handler: HTTPS cert error → try HTTP → if fails, use proxy
			const handleCorsError = () => {
				// If HTTPS and haven't tried HTTP yet, try HTTP first
				if (channelUrl.startsWith('https://') && !triedHttp) {
					console.log('HTTPS cert error detected, trying HTTP...');
					triedHttp = true;
					const httpUrl = channelUrl.replace('https://', 'http://');
					playChannel(httpUrl);
				} else {
					// Either already tried HTTP or it's an HTTP URL with CORS
					console.log('Auto-enabling proxy due to CORS/network error');
					proxyStore.set(true);
					proxy = true;
					triedHttp = false; // Reset for next channel
					playChannel(channelUrl);
				}
			};
			
			hlsInstance = await playHLSStream(channelUrl, videoRef, proxyEnabled, handleCorsError);
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

<div class="controls">
	<label>
		<input type="checkbox" on:change={handleProxyChange} bind:checked={proxy} /> Enable proxy
	</label>
	<label>
		<input type="checkbox" on:change={handleTranscodeChange} bind:checked={transcode} /> Transcode
	</label>
	<button class="reload-btn" on:click={handleReload}>Reload</button>
</div>
<video id="video" controls autoplay={Boolean($streamUrl)} bind:this={videoRef}>
	<source src={$streamUrl} type="video/mp4" />
</video>

<style>
	.controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.reload-btn {
		padding: 0.25rem 0.75rem;
		font-size: 0.875rem;
		cursor: pointer;
	}
	
	video {
		width: 50%;
		max-width: 80vw;
		height: auto;
	}
</style>
