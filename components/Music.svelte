<script>
	export let music = [];

	// Function to group and sort music files by artist and album
	function groupAndSortMusic(music) {
		const grouped = {};

		for (const file of music) {
			const { mediaInfo } = file;
			const { url } = file;
			const { artist, album, songname } = mediaInfo;

			if (!grouped[artist]) {
				grouped[artist] = {};
			}
			if (!grouped[artist][album]) {
				grouped[artist][album] = [];
			}
			grouped[artist][album].push({ songname, url, id: url, playing: false, audio: null });
		}

		// Sort artists, albums, and songs
		const sortedGrouped = {};
		const sortedArtists = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

		for (const artist of sortedArtists) {
			sortedGrouped[artist] = {};
			const sortedAlbums = Object.keys(grouped[artist]).sort((a, b) => a.localeCompare(b));

			for (const album of sortedAlbums) {
				sortedGrouped[artist][album] = grouped[artist][album].sort((a, b) =>
					a.songname.localeCompare(b.songname)
				);
			}
		}

		return sortedGrouped;
	}

	const groupedMusic = groupAndSortMusic(music);

	let currentlyPlaying = null;

	function toggleVisibility(event) {
		const content = event.target.nextElementSibling;
		if (content) {
			content.style.display = content.style.display === 'none' ? 'block' : 'none';
		}
	}

	function playSong(song) {
		if (currentlyPlaying && currentlyPlaying !== song) {
			currentlyPlaying.audio.pause();
			currentlyPlaying.playing = false;
		}
		song.playing = !song.playing;
		if (song.playing) {
			if (!song.audio) {
				song.audio = new Audio(song.url);
				song.audio.addEventListener('ended', () => {
					song.playing = false;
					currentlyPlaying = null;
					song.audio = null; // Cleanup the audio object
				});
			}
			song.audio.play();
			currentlyPlaying = song;
		} else {
			song.audio.pause();
			currentlyPlaying = null;
		}
	}
</script>

{#if Object.keys(groupedMusic).length}
	<section>
		{#each Object.entries(groupedMusic) as [artist, albums]}
			<div class="collapsible" on:click={toggleVisibility}>
				{artist}
			</div>
			<div class="content" style="display: none;">
				{#each Object.entries(albums) as [album, songs]}
					<div class="collapsible" on:click={toggleVisibility}>
						{album}
					</div>
					<div class="content" style="display: none;">
						{#each songs as song (song.id)}
							<div class="song">
								<a href={song.url}>{song.songname}</a>
								<button class="play-button" on:click={() => playSong(song)}>
									{song.playing ? '❚❚' : '▶'}
								</button>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/each}
	</section>
{/if}

<style>
	.collapsible {
		cursor: pointer;
		font-weight: bold;
	}

	.content {
		display: none;
		padding-left: 1em;
	}

	.song {
		padding-left: 1em;
		display: flex;
		align-items: center;
	}

	.song a {
		margin-right: 1em;
	}

	.play-button {
		background: none;
		border: none;
		font-size: 1em;
		cursor: pointer;
		margin-left: 0.5em;
		vertical-align: middle;
	}

	.play-button:focus {
		outline: none;
	}
</style>
