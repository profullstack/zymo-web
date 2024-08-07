<script>
	import {
		playlist,
		isPlaying,
		currentSongIndex,
		currentSongMetadata
	} from '../modules/store.js';
	import { get } from 'svelte/store';

	export let music = [];

	function groupAndSortMusic(music) {
		const grouped = {};

		for (const file of music) {
			const { mediaInfo } = file;
			const { url, user, pass, id } = file;
			const { artist, album, songname } = mediaInfo;

			if (!grouped[artist]) {
				grouped[artist] = {};
			}
			if (!grouped[artist][album]) {
				grouped[artist][album] = [];
			}
			grouped[artist][album].push({
				songname,
				url,
				user,
				pass,
				id,
				playing: false,
				artist,
				album
			});
		}

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

	let groupedMusic = groupAndSortMusic(music);

	let visibleArtists = new Set();
	let visibleAlbums = new Set();

	function toggleVisibility(set, key) {
		if (set.has(key)) {
			set.delete(key);
		} else {
			set.add(key);
		}
		visibleArtists = new Set(visibleArtists);
		visibleAlbums = new Set(visibleAlbums);
	}

	function playSong(song) {
		playlist.set([song]);
		currentSongIndex.set(0);
		currentSongMetadata.set({
			artist: song.artist,
			album: song.album,
			songname: song.songname
		});
		isPlaying.set(true);
	}

	function playAllSongs(songs) {
		playlist.set(songs);
		currentSongIndex.set(0);
		if (songs.length > 0) {
			const song = songs[0];
			currentSongMetadata.set({
				artist: song.artist,
				album: song.album,
				songname: song.songname
			});
		}
		isPlaying.set(true);
	}

	function randomizeAndPlaySongs(songs) {
		const shuffledSongs = songs.slice().sort(() => Math.random() - 0.5);
		playAllSongs(shuffledSongs);
	}

	$: {
		const allSongs = Object.values(groupedMusic).flat(2);
		const currentPlaylist = get(playlist);
		const index = get(currentSongIndex);
		allSongs.forEach((song) => {
			song.playing =
				currentPlaylist.includes(song) &&
				currentPlaylist.indexOf(song) === index &&
				get(isPlaying);
		});
	}
</script>

{#if Object.keys(groupedMusic).length}
	<section>
		{#each Object.entries(groupedMusic) as [artist, albums]}
			<div class="collapsible" on:click={() => toggleVisibility(visibleArtists, artist)}>
				{artist}
				<button
					class="play-button"
					on:click={(e) => {
						e.stopPropagation();
						playAllSongs(Object.values(albums).flat());
					}}>▶</button
				>
				<button
					class="random-button"
					on:click={(e) => {
						e.stopPropagation();
						randomizeAndPlaySongs(Object.values(albums).flat());
					}}>🔀</button
				>
			</div>
			{#if visibleArtists.has(artist)}
				<div class="content">
					{#each Object.entries(albums) as [album, songs]}
						<div
							class="collapsible"
							on:click={() => toggleVisibility(visibleAlbums, `${artist}-${album}`)}
						>
							{album}
							<button
								class="play-button"
								on:click={(e) => {
									e.stopPropagation();
									playAllSongs(songs);
								}}>▶</button
							>
							<button
								class="random-button"
								on:click={(e) => {
									e.stopPropagation();
									randomizeAndPlaySongs(songs);
								}}>🔀</button
							>
						</div>
						{#if visibleAlbums.has(`${artist}-${album}`)}
							<div class="content">
								{#each songs as song (song.id)}
									<div class="song">
										<a href={song.url}>{song.songname}</a>
										<button class="play-button" on:click={() => playSong(song)}>
											{song.playing ? '❚❚' : '▶'}
										</button>
									</div>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/each}
	</section>
{/if}

<style>
	.collapsible {
		cursor: pointer;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.content {
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

	.play-button,
	.random-button {
		background: none;
		border: none;
		font-size: 1em;
		cursor: pointer;
		margin-left: 0.5em;
		vertical-align: middle;
	}

	.play-button:focus,
	.random-button:focus {
		outline: none;
	}
</style>
