<script>
	import { onMount } from 'svelte';

	export let movie = {};
	export let proxy = false;

	const { user, pass, file } = movie;
	let type = file.split('.').pop();

	let url = movie.url;
	let videoRef;
	let transcode = false;

	// if (!movie.url.endsWith('.mp4')) {
	// 	transcode = true;
	// 	transcodeMedia();
	// }

	try {
		movie.humanTitle = movie.mediaInfo ? movie.mediaInfo.name : decodeURIComponent(movie.title);
	} catch (err) {
		console.error(err, movie.mediaInfo.name);
		movie.humanTitle = movie.title;
	}

	try {
		movie.humanPath = decodeURIComponent(movie.path);
	} catch (err) {
		movie.humanPath = movie.path;
	}

	function proxifyUrl() {
		if (user && pass) {
			if (proxy) {
				url = `/proxy?user=${user}&pass=${pass}&url=${encodeURIComponent(movie.url)}`;
			} else {
				url = movie.url.replace(/(https?):\/\//, `$1://${user}:${pass}@`);
			}
		} else if (proxy) {
			url = `/proxy?url=${encodeURIComponent(movie.url)}`;
		} else {
			url = movie.url;
		}
	}

	function transcodeMedia() {
		if (user && pass) {
			if (transcode) {
				url = `/api/transcode?user=${user}&pass=${pass}&url=${encodeURIComponent(movie.url)}`;
			} else {
				url = movie.url.replace(/(https?):\/\//, `$1://${user}:${pass}@`);
			}
		} else if (transcode) {
			url = `/api/transcode?url=${encodeURIComponent(movie.url)}`;
		} else {
			url = movie.url;
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
		// movie.mediaInfo = parseMediaInfo(movie.file);
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
		<h1><a href={movie.url}>{movie.humanTitle}</a></h1>
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

		<pre>{JSON.stringify(movie.mediaInfo, null, 2)}</pre>
	</section>
{/if}

<style>
	video {
		width: 50%;
		max-width: 80vw;
		height: auto;
	}
</style>
