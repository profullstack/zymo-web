<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		audioContext,
		audioElement,
		isPlaying,
		playlist,
		currentSongIndex,
		currentSongMetadata,
		isMuted,
		volumeLevel
	} from '../modules/store.js';
	import { get } from 'svelte/store';

	let localAudioContext = get(audioContext);
	let localAudioElement = get(audioElement);
	let track;
	let gainNode;
	let playing = get(isPlaying);
	let songs = get(playlist);
	let songIndex = get(currentSongIndex);
	let songMetadata = get(currentSongMetadata);
	let currentTime = 0;
	let duration = 0;
	let muted = get(isMuted);
	let volume = get(volumeLevel);
	let showVolume = false;

	function getProxyUrl(song) {
		if (song.user && song.pass) {
			return `/proxy?user=${song.user}&pass=${song.pass}&url=${encodeURIComponent(song.url)}`;
		}
		return song.url;
	}

	function playSongAtIndex(index) {
		if (index >= 0 && index < songs.length) {
			const song = songs[index];

			localAudioElement.src = getProxyUrl(song);

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
			localAudioElement.addEventListener('timeupdate', updateProgress);
			localAudioElement.addEventListener('loadedmetadata', () => {
				duration = localAudioElement.duration;
			});

			localAudioElement.volume = volume;
			localAudioElement.muted = muted;
		}
	}

	function handleSongEnd() {
		if (songIndex < songs.length - 1) {
			playSongAtIndex(songIndex + 1);
		} else {
			isPlaying.set(false);
		}
	}

	function updateProgress() {
		currentTime = localAudioElement.currentTime;
	}

	onMount(() => {
		if (!localAudioContext) {
			localAudioContext = new (window.AudioContext || window.webkitAudioContext)();
			audioContext.set(localAudioContext);
		}

		if (!localAudioElement) {
			localAudioElement = new Audio();
			audioElement.set(localAudioElement);
		}

		track = localAudioContext.createMediaElementSource(localAudioElement);
		gainNode = localAudioContext.createGain();
		track.connect(gainNode).connect(localAudioContext.destination);

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

		isMuted.subscribe((value) => {
			muted = value;
			if (localAudioElement) {
				localAudioElement.muted = muted;
			}
		});

		volumeLevel.subscribe((value) => {
			volume = value;
			if (localAudioElement) {
				localAudioElement.volume = volume;
			}
		});

		currentSongMetadata.subscribe((value) => {
			songMetadata = value;
		});
	});

	onDestroy(() => {
		if (localAudioElement) {
			localAudioElement.pause();
			localAudioElement.src = '';
			localAudioElement.load();
		}
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
		isPlaying.set(false);
		playlist.set([]);
		currentSongIndex.set(0);
		currentSongMetadata.set({ artist: '', album: '', songname: '' });
		currentTime = 0;
		duration = 0;
	}

	function toggleMute() {
		isMuted.set(!muted);
	}

	function setVolume(event) {
		volumeLevel.set(event.target.value);
	}

	function handleSeek(event) {
		const seekTime = (event.target.value / 100) * duration;
		localAudioElement.currentTime = seekTime;
	}

	function toggleVolume() {
		showVolume = !showVolume;
	}
</script>

<div class="player-bar">
	<div class="controls">
		<span>{playing ? 'Playing' : 'Paused'}</span>
		<button on:click={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
		<button on:click={stopPlayback}>Stop</button>
		<button on:click={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
		<div class="volume-button-container">
			<button on:click={toggleVolume}>Volume</button>
			{#if showVolume}
				<div class="volume-container">
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						on:input={setVolume}
						class="volume-slider"
					/>
				</div>
			{/if}
		</div>
	</div>
	{#if songMetadata.artist && songMetadata.album && songMetadata.songname}
		<div class="song-info">
			<small>{songMetadata.artist} - {songMetadata.album} - {songMetadata.songname}</small>
		</div>
	{/if}
	<div class="progress-bar">
		<input
			type="range"
			min="0"
			max="100"
			value={(currentTime / duration) * 100}
			on:input={handleSeek}
		/>
	</div>
</div>

<style>
	.player-bar {
		position: fixed;
		bottom: 0;
		width: 100%;
		background: var(--player-background-color);
		color: var(--body-color);
		padding: 0.8rem 0.8rem 0 0.8rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		opacity: 0.7;
	}
	.player-bar:hover {
		opacity: 1;
	}

	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		margin-bottom: 0.4rem;
		position: relative;
	}
	button {
		margin: 0 0.4rem;
		padding: 0.4rem 0.8rem;
		background: var(--button-background-color);
		color: var(--button-color);
		border: 1px solid var(--button-border-color);
		cursor: pointer;
	}
	.song-info {
		text-align: center;
		margin-bottom: 0.4rem;
	}
	.progress-bar {
		width: 100%;
		margin-bottom: 0.4rem;
		text-align: center;
	}
	input[type='range'] {
		width: 50%;
	}
	.volume-button-container {
		position: relative;
	}
	.volume-container {
		position: absolute;
		bottom: 4rem; /* Adjust as needed to position above the player bar */
		left: 50%;
		transform: translateX(-50%);
		background: #333;
		padding: 0.4rem;
		border-radius: 5px;
		width: 4rem; /* Set the width of the container */
		height: max-content; /* Set the height of the container */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.volume-container input[type='range'] {
		width: 10rem;
	}

	.volume-slider {
		transform: rotate(-90deg);
		width: 10rem; /* Set the width to match the height */
		height: 10rem; /* Set the height of the slider */
	}
</style>
