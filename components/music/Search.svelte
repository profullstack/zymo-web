<script>
	import {
		playlist,
		isPlaying,
		currentSongIndex,
		currentSongMetadata
	} from '../../modules/store.js';
	import { get } from 'svelte/store';

	export let music = [];

    console.log('music:', music);

	let filteredMusic = music;
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
			songname: song.songname,
			coverArt: song?.musicbrainz?.coverArt
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
				songname: song.songname,
				coverArt: song?.musicbrainz?.coverArt
			});
		}
		isPlaying.set(true);
	}

	function randomizeAndPlaySongs(songs) {
		const shuffledSongs = songs.slice().sort(() => Math.random() - 0.5);
		playAllSongs(shuffledSongs);
	}

	$: {
		const allSongs = Object.values(filteredMusic).flat(2);
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

{#if Object.keys(filteredMusic).length}
	<section>
		{#each Object.entries(filteredMusic) as [artist, albums]}
			<div class="collapsible" on:click={() => toggleVisibility(visibleArtists, artist)}>
				<button
					class="play-button"
					on:click={(e) => {
						e.stopPropagation();
						playAllSongs(Object.values(albums).flat());
					}}><img src="/icons/play.svg" alt="" style="width: 3rem;" /></button
				>
				<button
					class="random-button"
					on:click={(e) => {
						e.stopPropagation();
						randomizeAndPlaySongs(Object.values(albums).flat());
					}}><img src="/icons/shuffle.svg" alt="" style="width: 3rem;" /></button
				>
				{artist}
			</div>
			{#if visibleArtists.has(artist)}
				<div class="content">
					{#each Object.entries(albums) as [album, songs]}
						<div
							class="collapsible"
							on:click={() => toggleVisibility(visibleAlbums, `${artist}-${album}`)}
						>
							{#if songs[0] && songs[0].musicbrainz && songs[0].musicbrainz.coverArt}
								<img src={songs[0].musicbrainz.coverArt} alt="" class="poster" />
							{:else}
								<img class="poster" src="/icons/placeholder.music.svg" alt="" />
							{/if}
							<button
								class="play-button"
								on:click={(e) => {
									e.stopPropagation();
									playAllSongs(songs);
								}}><img src="/icons/play.svg" alt="" /></button
							>
							<button
								class="random-button"
								on:click={(e) => {
									e.stopPropagation();
									randomizeAndPlaySongs(songs);
								}}><img src="/icons/shuffle.svg" alt="" /></button
							>
							{album}
						</div>
						{#if visibleAlbums.has(`${artist}-${album}`)}
							<div class="content">
								{#each songs as song (song.id)}
									<div class="song">
										<button class="play-button" on:click={() => playSong(song)}>
											{#if song.playing}
												{'❚❚'}
											{:else}
												<img src="/icons/play.svg" alt="" />
											{/if}
										</button>
										<a href={song.url}>{song.songname}</a>
									</div>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/each}
	</section>
{:else}
	<p>No artists found.</p>
{/if}

<style>
	.collapsible {
		cursor: pointer;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin: 2rem 0;
	}

	.content {
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: flex-start;
		padding-left: 1em;
		margin: 2rem 0;
	}

	.song {
		padding-left: 1em;
		display: flex;
		align-items: center;
	}

	.song a {
		margin-left: 1em;
	}

	.play-button,
	.random-button {
		background: none;
		border: none;
		font-size: 1em;
		cursor: pointer;
		vertical-align: middle;
		padding: 0.2rem;
		margin: 0.2rem 0.2rem 0.2rem 1.2rem;
	}

	.play-button img,
	.random-button img {
		display: block;
		width: 2rem;
		height: auto;
	}

	.play-button:focus,
	.random-button:focus {
		outline: none;
	}

	.poster {
		width: 6rem;
		height: auto;
		border: 1px solid var(--cover-art-border-color);
	}
</style>
