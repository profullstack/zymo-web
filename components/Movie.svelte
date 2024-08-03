<script>
	import { onMount } from 'svelte';

	export let movie = {};
	export let proxy = false;

	const { user, pass, file } = movie;
	const type = file.split('.').pop();

	let url = movie.url;

	if (user && pass) {
		if (proxy) {
			url = `/proxy?user=${user}&pass=${pass}&url=${encodeURIComponent(movie.url)}`;
		} else {
			url = movie.url.replace(/(https?):\/\//, `$1://${user}:${pass}@`);
		}
	} else if (proxy) {
		url = `/proxy?url=${encodeURIComponent(movie.url)}`;
	}

	// Function to handle checkbox change
	function handleCheckboxChange(event) {
		if (event.target.checked) {
			// Reload the page with ?proxy=1
			window.location.search = '?proxy=1';
		} else {
			// Reload the page without ?proxy=1
			window.location.search = '';
		}
	}

	// Set the initial state of the checkbox based on the proxy variable
	onMount(() => {
		const checkbox = document.querySelector('#proxy-checkbox');
		if (proxy) {
			checkbox.checked = true;
		}
	});
</script>

{#if url}
	<section>
		<h1><a href={movie.url}>{movie.title}</a></h1>
		<div class="field">
			<label>
				<input type="checkbox" id="proxy-checkbox" on:change={handleCheckboxChange} />
				Enable proxy
			</label>
		</div>
		<video controls autoplay playsinline>
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
