<script>
	import { onMount } from 'svelte';

	export let movie = {};
	export let proxy = false;

	const { user, pass, file } = movie;
	const type = file.split('.').pop();

	let url = movie.url;
	let videoRef;

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

	// Function to handle checkbox change
	function handleCheckboxChange(event) {
		proxy = event.target.checked;
		proxifyUrl();
	}

	// Set the initial state of the checkbox based on the proxy variable
	onMount(() => {
		const checkbox = document.querySelector('#proxy-checkbox');
		if (proxy) {
			checkbox.checked = true;
		}
		proxifyUrl();
	});

	$: proxifyUrl();

	$: if (url && videoRef) {
		const source = videoRef.querySelector('source');
		source.src = url;
		videoRef.load();
	}
</script>

{#if url}
	<section>
		<h1><a href={movie.url}>{movie.title}</a></h1>
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
		<video controls autoplay playsinline bind:this={videoRef}>
			<source src={url} type="video/{type}" />
		</video>
	</section>
{/if}

<style>
	video {
		width: 100%;
		max-width: 80vw;
		height: auto;
	}
</style>
