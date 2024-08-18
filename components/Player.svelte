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
		volumeLevel,
		isInitialized // Global store for initialization
	} from '../modules/store.js';

	let localAudioContext;
	let localAudioElement;
	let currentTime = 0;
	let duration = 0;
	let showVolume = false;

	let playing;
	let songs = [];
	let songIndex;
	let songMetadata = { artist: '', album: '', songname: '' };
	let muted;
	let volume;

	onMount(() => {
		isInitialized.subscribe((value) => {
			if (!value) {
				initializePlayer();
				isInitialized.set(true);
			} else {
				// Resume or continue using the existing player instance
				resumePlayer();
			}
		});
	});

	function initializePlayer() {
		const unsubAudioContext = audioContext.subscribe((value) => {
			if (!value) {
				value = new (window.AudioContext || window.webkitAudioContext)();
				audioContext.set(value);
			}
			localAudioContext = value;
		});

		const unsubAudioElement = audioElement.subscribe((value) => {
			if (!value) {
				value = new Audio();
				audioElement.set(value);
			}
			localAudioElement = value;
		});

		const unsubPlaylist = playlist.subscribe((value) => {
			songs = value;
			if (songs.length > 0 && songIndex >= 0 && songIndex < songs.length) {
				playSongAtIndex(songIndex);
			}
		});

		const unsubCurrentSongIndex = currentSongIndex.subscribe((value) => {
			songIndex = value;
			if (songs.length > 0 && songIndex >= 0 && songIndex < songs.length) {
				playSongAtIndex(songIndex);
			}
		});

		const unsubIsPlaying = isPlaying.subscribe((value) => {
			playing = value;
			if (playing) {
				localAudioContext.resume().then(() => {
					localAudioElement.play();
				});
			} else {
				localAudioElement.pause();
			}
		});

		const unsubIsMuted = isMuted.subscribe((value) => {
			muted = value;
			localAudioElement.muted = muted;
		});

		const unsubVolumeLevel = volumeLevel.subscribe((value) => {
			volume = value;
			localAudioElement.volume = volume;
		});

		const unsubCurrentSongMetadata = currentSongMetadata.subscribe((value) => {
			songMetadata = value || { artist: '', album: '', songname: '' };
		});

		// onDestroy(() => {
		// 	unsubAudioContext();
		// 	unsubAudioElement();
		// 	unsubPlaylist();
		// 	unsubCurrentSongIndex();
		// 	unsubIsPlaying();
		// 	unsubIsMuted();
		// 	unsubVolumeLevel();
		// 	unsubCurrentSongMetadata();
		// });
	}

	function resumePlayer() {
		audioContext.subscribe((value) => {
			localAudioContext = value;
		});

		audioElement.subscribe((value) => {
			if (!localAudioElement) {
				localAudioElement = value;
				localAudioElement.preload = 'auto';
				duration = localAudioElement.duration;
				localAudioElement.addEventListener('ended', handleSongEnd);
				localAudioElement.addEventListener('timeupdate', updateProgress);
			}
		});

		playlist.subscribe((value) => {
			songs = value;
		});

		currentSongIndex.subscribe((value) => {
			songIndex = value;
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
			localAudioElement.muted = muted;
		});

		volumeLevel.subscribe((value) => {
			volume = value;
			localAudioElement.volume = volume;
		});

		currentSongMetadata.subscribe((value) => {
			songMetadata = value || { artist: '', album: '', songname: '' };
			if ('mediaSession' in navigator) {
				navigator.mediaSession.metadata = new MediaMetadata({
					title: value.songname,
					artist: value.artist,
					album: value.album,
					artwork: [
						{
							src: value.coverArt || '/icons/placeholder.music.svg',
							sizes: '512x512',
							type: 'image/png'
						}
					]
				});
			}
		});
	}

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
				artist: song.artist || '',
				album: song.album || '',
				songname: song.songname || ''
			});

			localAudioElement.addEventListener('ended', handleSongEnd);
			localAudioElement.addEventListener('timeupdate', updateProgress);
			localAudioElement.addEventListener('loadedmetadata', () => {
				duration = localAudioElement.duration;
			});
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

	function togglePlay() {
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
			<img class="poster" src={songMetadata.coverArt || '/icons/placeholder.music.svg'} />
			<small>{songMetadata.artist} - {songMetadata.album} - {songMetadata.songname}</small>
		</div>
	{/if}
	<div class="progress-bar">
		<input
			type="range"
			min="0"
			max="100"
			value={(currentTime / duration) * 100 || 0}
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
	.progress-bar input {
		padding: 0.8rem 0;
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.poster {
		width: 6rem;
		height: auto;
		border: 1px solid var(--cover-art-border-color);
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
