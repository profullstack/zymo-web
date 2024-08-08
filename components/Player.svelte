<script>
	import { onMount } from 'svelte';
	import {
		audioContext,
		audioElement,
		isPlaying,
		playlist,
		currentSongIndex,
		currentSongMetadata,
		isMuted,
		volumeLevel // Import the volumeLevel store
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
	let currentTime = 0;
	let duration = 0;
	let muted = get(isMuted);
	let volume = get(volumeLevel);
	let showVolume = false; // State to manage volume bar visibility

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
			localAudioElement.addEventListener('timeupdate', updateProgress);
			localAudioElement.addEventListener('loadedmetadata', () => {
				duration = localAudioElement.duration;
			});
			// Set initial volume and mute state
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
		if (!get(audioContext)) {
			localAudioContext = new (window.AudioContext || window.webkitAudioContext)();
			audioContext.set(localAudioContext);

			localAudioElement = new Audio();
			audioElement.set(localAudioElement);

			track = localAudioContext.createMediaElementSource(localAudioElement);
			gainNode = localAudioContext.createGain();
			track.connect(gainNode).connect(localAudioContext.destination);

			localAudioElement.addEventListener('ended', handleSongEnd);
			localAudioElement.addEventListener('timeupdate', updateProgress);
		} else {
			localAudioContext = get(audioContext);
			localAudioElement = get(audioElement);
			localAudioElement.addEventListener('ended', handleSongEnd);
			localAudioElement.addEventListener('timeupdate', updateProgress);
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
		localAudioElement.src = ''; // Clear the source to stop the audio completely
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
			<span>{songMetadata.artist} - {songMetadata.album} - {songMetadata.songname}</span>
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
		background: #333;
		color: white;
		padding: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		margin-bottom: 5px;
		position: relative;
	}
	button {
		margin: 0 5px;
		padding: 5px 10px;
		background: #555;
		color: white;
		border: none;
		cursor: pointer;
	}
	.song-info {
		text-align: center;
		margin-bottom: 5px;
	}
	.progress-bar {
		width: 100%;
		margin-bottom: 5px;
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
		bottom: 50px; /* Adjust as needed to position above the player bar */
		left: 50%;
		transform: translateX(-50%);
		background: #333;
		padding: 5px;
		border-radius: 5px;
		width: 40px; /* Set the width of the container */
		height: max-content; /* Set the height of the container */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.volume-container input[type='range'] {
		width: 100px;
	}

	.volume-slider {
		transform: rotate(-90deg);
		width: 100px; /* Set the width to match the height */
		height: 100px; /* Set the height of the slider */
	}
</style>
