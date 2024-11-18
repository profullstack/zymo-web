<script>
	import {
		playlist,
		isPlaying,
		currentSongIndex,
		currentSongMetadata
	} from '../../modules/store.js';

	export let results = [];
	let feeds = {};
	let isOpen = {};

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
		isOpen[podcast.url] = !isOpen[podcast.url];
		
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

<ul>
	{#each results as podcast}
		<li>
			<div class="podcast-item">
				<img src={podcast.image} alt="" class="podcast-image" />
				<div class="podcast-content">
					<h4>
						<a href={podcast.url}>{podcast.title}</a>
					</h4>
					<div class="description">{podcast.description}</div>
					<!-- Additional metadata can go here -->
					<a
						href="#"
						on:click|preventDefault={() => {
							follow(podcast);
						}}>follow</a
					>
					<a
						href="#"
						on:click|preventDefault={() => {
							view(podcast);
						}}>view</a
					>
				</div>
			</div>
			{#if feeds[podcast.url] && isOpen[podcast.url]}
				<ul>
					{#each feeds[podcast.url].rss?.channel[0]?.item as item}
						<li>
							<a
								href="#"
								class="play-button"
								on:click|preventDefault={() => {
									item.channel = feeds[podcast.url].rss.channel[0];
									playItem(item);
								}}
							>
								{#if item.playing}
									{'❚❚'}
								{:else}
									<img src="/icons/play.svg" alt="" />
								{/if}</a
							>
							<a href={item.enclosure[0].$.url}>{item.title}</a>
						</li>
					{/each}
				</ul>
			{/if}
		</li>
	{/each}
</ul>

<style>
    	li {
		margin-left: 4rem;
		list-style: none;
	}

	.podcast-item {
		display: flex;
		align-items: flex-start; /* Align items at the start vertically */
		margin-bottom: 1rem; /* Add spacing between list items */
	}

	.podcast-image {
		margin-right: 1rem; /* Space between the image and content */
		width: 100px; /* Set desired width */
		height: auto;
	}

	.podcast-content {
		flex: 1; /* Allow content to fill the remaining space */
	}

	.description {
		margin-top: 0.5rem; /* Space between title and description */
	}

	a {
		display: inline-block;
		margin-top: 0.5rem; /* Space above the follow link */
	}

	.play-button img {
		display: block;
		width: 2rem;
		height: auto;
	}

</style>