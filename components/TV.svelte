<script>
	import { onMount } from 'svelte';

	export let show = {};
	export let proxy = false;

	const { user, pass, file } = show;
	let type = file.split('.').pop();

	let url = show.url;
	let videoRef;
	let transcode = false;

	// if (!show.url.endsWith('.mp4')) {
	// 	transcode = true;
	// 	transcodeMedia();
	// }

	try {
		show.humanTitle = show.mediaInfo ? show.mediaInfo.name : decodeURIComponent(show.title);
	} catch (err) {
		console.error(err, show.mediaInfo.name);
		show.humanTitle = show.title;
	}

	try {
		show.humanPath = decodeURIComponent(show.path);
	} catch (err) {
		show.humanPath = show.path;
	}

	function proxifyUrl() {
		if (user && pass) {
			if (proxy) {
				url = `/proxy?user=${user}&pass=${pass}&url=${encodeURIComponent(show.url)}`;
			} else {
				url = show.url.replace(/(https?):\/\//, `$1://${user}:${pass}@`);
			}
		} else if (proxy) {
			url = `/proxy?url=${encodeURIComponent(show.url)}`;
		} else {
			url = show.url;
		}
	}

	function transcodeMedia() {
		if (user && pass) {
			if (transcode) {
				url = `/api/transcode?user=${user}&pass=${pass}&url=${encodeURIComponent(show.url)}`;
			} else {
				url = show.url.replace(/(https?):\/\//, `$1://${user}:${pass}@`);
			}
		} else if (transcode) {
			url = `/api/transcode?url=${encodeURIComponent(show.url)}`;
		} else {
			url = show.url;
		}

		type = 'mp4';
		console.log(url);
	}
	// Function to handle checkbox change
	function handleCheckboxChange(event) {
		proxy = event.target.checked;
		proxifyUrl();
	}

	// Function to handle checkbox change
	function handleTranscodeCheckboxChange(event) {
		transcode = event.target.checked;
		console.log('transcoding:', transcode);
		transcodeMedia();
	}

	// Set the initial state of the checkbox based on the proxy variable
	onMount(() => {
		// show.mediaInfo = parseMediaInfo(show.file);
		const checkbox = document.querySelector('#proxy-checkbox');
		if (proxy) {
			checkbox.checked = true;
		}

		proxifyUrl();
	});

	$: proxifyUrl();
	$: transcodeMedia();

	$: if (url && videoRef) {
		const source = videoRef.querySelector('source');
		source.src = url;
		videoRef.load();
	}
</script>

{#if url}
	<section>
		<h1><a href={show.url}>{show.humanTitle}</a></h1>
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
		<video controls autoplay playsinline bind:this={videoRef}>
			<source src={url} type="video/{type}" />
		</video>

		<pre>{JSON.stringify(show.mediaInfo, null, 2)}</pre>
	</section>
{/if}

<style>
	video {
		width: 50%;
		max-width: 80vw;
		height: auto;
	}
</style>
