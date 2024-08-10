<script>
	export let movies = [];

	// Function to group and sort movies by show name and optionally by season
	function groupAndSortMovies(movies) {
		const grouped = {};

		for (const movie of movies) {
			const showName = movie.mediaInfo?.name || 'Unknown Show';
			const videoType = movie.mediaInfo?.videoType || 'movie';
			const season = videoType === 'tv show' ? movie.mediaInfo?.season || 0 : null;
			const id = movie.id;

			if (!grouped[showName]) {
				grouped[showName] = {};
			}
			if (season !== null) {
				if (!grouped[showName][season]) {
					grouped[showName][season] = [];
				}
				grouped[showName][season].push({ ...movie });
			} else {
				if (!grouped[showName][0]) {
					grouped[showName][0] = [];
				}
				grouped[showName][0].push({ ...movie });
			}
		}

		// Sort shows and seasons
		const sortedGrouped = {};
		const sortedShows = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

		for (const show of sortedShows) {
			sortedGrouped[show] = {};
			const sortedSeasons = Object.keys(grouped[show])
				.map(Number)
				.sort((a, b) => a - b);

			for (const season of sortedSeasons) {
				sortedGrouped[show][season] = grouped[show][season].sort((a, b) => {
					const nameA = a.mediaInfo?.name || '';
					const nameB = b.mediaInfo?.name || '';
					return nameA.localeCompare(nameB);
				});
			}
		}

		return sortedGrouped;
	}

	let groupedMovies = groupAndSortMovies(movies);

	let visibleShows = new Set();
	let visibleSeasons = new Set();

	function toggleVisibility(set, key) {
		if (set.has(key)) {
			set.delete(key);
		} else {
			set.add(key);
		}
		// Force reactivity
		visibleShows = new Set(visibleShows);
		visibleSeasons = new Set(visibleSeasons);
	}
</script>

{#if Object.keys(groupedMovies).length}
	<section>
		{#each Object.entries(groupedMovies) as [showName, seasons]}
			<div class="collapsible" on:click={() => toggleVisibility(visibleShows, showName)}>
				{showName}
			</div>
			{#if visibleShows.has(showName)}
				<div class="content">
					{#each Object.entries(seasons) as [season, episodes]}
						{#if season != 0}
							<div
								class="collapsible"
								on:click={() =>
									toggleVisibility(visibleSeasons, `${showName}-${season}`)}
							>
								Season {season}
							</div>
							{#if visibleSeasons.has(`${showName}-${season}`)}
								<div class="content">
									{#each episodes as movie}
										<div class="movie">
											{#if movie.omdb?.Poster}
												<img
													class="poster"
													src={movie.omdb.Poster}
													alt=""
												/>
											{:else}
												<img
													class="poster"
													src="/static/icons/placeholder.movie.svg"
													alt=""
												/>
											{/if}
											<a href="/movies/{movie.id}">watch</a>
											<a href={movie.url}>
												{movie.mediaInfo?.name || 'Unknown Name'} - ({movie.fileExt})
											</a>
										</div>
									{/each}
								</div>
							{/if}
						{:else}
							{#each episodes as movie}
								<div class="movie">
									{#if movie.omdb?.Poster}
										<img class="poster" src={movie.omdb.Poster} alt="" />
									{:else}
										<img
											class="poster"
											src="/static/icons/placeholder.movie.svg"
											alt=""
										/>
									{/if}
									<a href="/movies/{movie.id}">watch</a>
									<a href={movie.url}>
										{movie.mediaInfo?.name || 'Unknown Name'} - ({movie.fileExt})
									</a>
								</div>
							{/each}
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
	}

	.content {
		padding-left: 1em;
	}

	.movie {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding-left: 1em;
		margin: 2rem 0;
	}

	.movie a {
		margin-left: 1em;
	}

	.poster {
		width: 6rem;
		height: auto;
		border: 1px solid var(--button-border-color);
	}
</style>
