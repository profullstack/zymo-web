<script>
	import { onMount } from 'svelte';
	import {
		audioContext,
		audioElement,
		isPlaying,
		playlist,
		currentSongIndex,
		currentSongMetadata
	} from '../modules/store.js';
	import { get } from 'svelte/store';

	let localAudioContext;
	let localAudioElement;
	let track;
	let gainNode;
	let playing = get(isPlaying);
	let songs = get(playlist);
	let songIndex = get(currentSongIndex);
	let songMetadata = get(currentSongMetadata);

	function getProxyUrl(song) {
		if (song.user && song.pass) {
			return `/proxy?user=${song.user}&pass=${song.pass}&url=${encodeURIComponent(song.url)}`;
		}
		return song.url;
	}

	function playSongAtIndex(index) {
		if (index >= 0 && index < songs.length) {
			const song = songs[index];

			// Pause and reset the current audio element before creating a new one
			if (localAudioElement) {
				localAudioElement.pause();
				localAudioElement.src = '';
				localAudioElement.load();
			}

			localAudioElement = new Audio(getProxyUrl(song));
			audioElement.set(localAudioElement);

			if (playing) {
				localAudioElement.play();
			}
			currentSongIndex.set(index);
			currentSongMetadata.set({
				artist: song.artist,
				album: song.album,
				songname: song.songname
			});

			localAudioElement.addEventListener('ended', handleSongEnd);
		}
	}

	function handleSongEnd() {
		if (songIndex < songs.length - 1) {
			playSongAtIndex(songIndex + 1);
		} else {
			isPlaying.set(false);
		}
	}

	onMount(() => {
		if (!get(audioContext)) {
			localAudioContext = new (window.AudioContext || window.webkitAudioContext)();
			audioContext.set(localAudioContext);

			localAudioElement = new Audio();
			audioElement.set(localAudioElement);

			track = localAudioContext.createMediaElementSource(localAudioElement);
			gainNode = localAudioContext.createGain();
			track.connect(gainNode).connect(localAudioContext.destination);

			localAudioElement.addEventListener('ended', handleSongEnd);
		} else {
			localAudioContext = get(audioContext);
			localAudioElement = get(audioElement);
			localAudioElement.addEventListener('ended', handleSongEnd);
		}

		playlist.subscribe((value) => {
			songs = value;
			if (songs.length > 0 && songIndex >= 0 && songIndex < songs.length) {
				playSongAtIndex(songIndex);
			}
		});

		currentSongIndex.subscribe((value) => {
			songIndex = value;
			if (songs.length > 0 && songIndex >= 0 && songIndex < songs.length) {
				playSongAtIndex(songIndex);
			}
		});

		isPlaying.subscribe((value) => {
			playing = value;
			if (playing) {
				localAudioContext.resume().then(() => {
					localAudioElement.play();
				});
			} else {
				localAudioElement.pause();
			}
		});

		currentSongMetadata.subscribe((value) => {
			songMetadata = value;
		});
	});

	function togglePlay() {
		if (playing) {
			localAudioElement.pause();
		} else {
			localAudioContext.resume().then(() => {
				localAudioElement.play();
			});
		}
		isPlaying.set(!playing);
	}

	function stopPlayback() {
		localAudioElement.pause();
		localAudioElement.src = '';
		localAudioElement.load();
		isPlaying.set(false);
		playlist.set([]);
		currentSongIndex.set(0);
		currentSongMetadata.set({ artist: '', album: '', songname: '' });
	}
</script>

<div class="player-bar">
	<span>{playing ? 'Playing' : 'Paused'}</span>
	<button on:click={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
	<button on:click={stopPlayback}>Stop</button>
	{#if songMetadata.artist && songMetadata.album && songMetadata.songname}
		<div class="song-info">
			<span>{songMetadata.artist} - {songMetadata.album} - {songMetadata.songname}</span>
		</div>
	{/if}
</div>

<style>
	.player-bar {
		position: fixed;
		bottom: 0;
		width: 100%;
		background: #333;
		color: white;
		padding: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	button {
		margin-left: 10px;
		padding: 5px 10px;
		background: #555;
		color: white;
		border: none;
		cursor: pointer;
	}
	.song-info {
		flex-grow: 1;
		text-align: center;
	}
</style>
