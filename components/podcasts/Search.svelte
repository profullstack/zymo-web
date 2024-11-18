<script>
	import Spinner from '../Spinner.svelte';
	import {
		playlist,
		isPlaying,
		currentSongIndex,
		currentSongMetadata
	} from '../../modules/store.js';
	import PodcastSearch from './Podcast.svelte'

	let results = [];
	let q = '';
	let isLoading = false;
	let feeds = {};

	function playItem(song) {
		console.log(song, '<< song');
		const enclosure = song.enclosure[0].$;

		song.url = enclosure.url;
		song.title = song.title[0];
		song.channelTitle = song.channel.title[0];
		song.cover = song.channel['itunes:image'][0].$.href;

		playlist.set([song]);
		currentSongIndex.set(0);
		currentSongMetadata.set({
			artist: song.channelTitle,
			album: song.title,
			songname: song.title,
			coverArt: song.cover
		});

		isPlaying.set(true);
	}

	async function searchPodcasts() {
		isLoading = true;
		try {
			const res = await fetch('/api/podcasts/search?q=' + encodeURIComponent(q));

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			results = (await res.json()).data;
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	async function follow(podcast) {
		console.log(podcast);

		try {
			const res = await fetch('/api/podcasts/follow', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(podcast)
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const data = await res.json();

			console.log(data);
			feeds[podcast.url] = data;
		} catch (err) {
			console.error('Follow failed:', err);
		}
	}

	async function view(podcast) {
		console.log(podcast);

		try {
			const res = await fetch('/api/podcasts/feed', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(podcast)
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const data = await res.json();

			console.log(data);

			feeds[podcast.url] = data;
		} catch (err) {
			console.error('Follow failed:', err);
		}
	}

	$: results;
</script>

<h1>Podcast search</h1>

<form on:submit|preventDefault={searchPodcasts}>
	<label for="q">Search:</label>
	<input type="text" bind:value={q} placeholder="ie: Joe Rogan" id="q" />

	<button>Search</button>
	{#if isLoading}
		<Spinner color="#672ad6" />
	{/if}
</form>

<PodcastSearch results={results} />

<style>
	form {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin: 0.8rem 0;
	}

	form label {
		text-wrap: nowrap;
		margin: 0 0.4rem;
	}
</style>
