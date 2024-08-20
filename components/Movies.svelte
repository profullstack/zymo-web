<script>
	export let movies = [];

	let filterText = '';
	let groupedMovies = groupAndSortMovies(movies);
	let filteredMovies = groupedMovies;

	// Function to group and sort movies by show name and optionally by season
	function groupAndSortMovies(movies) {
		const grouped = {};

		for (const movie of movies) {
			const showName = movie.mediaInfo?.name || 'Unknown Show';
			const videoType = movie.mediaInfo?.videoType || 'movie';
			const season = videoType === 'tv show' ? movie.mediaInfo?.season || 0 : null;
			const id = movie.id;

			if (!grouped[showName]) {
				grouped[showName] = {
					poster: movie.omdb?.Poster || '/static/icons/placeholder.movie.svg',
					seasons: {}
				};
			}
			if (season !== null) {
				if (!grouped[showName].seasons[season]) {
					grouped[showName].seasons[season] = [];
				}
				grouped[showName].seasons[season].push({ ...movie });
			} else {
				if (!grouped[showName].seasons[0]) {
					grouped[showName].seasons[0] = [];
				}
				grouped[showName].seasons[0].push({ ...movie });
			}
		}

		// Sort shows and seasons
		const sortedGrouped = {};
		const sortedShows = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

		for (const show of sortedShows) {
			sortedGrouped[show] = grouped[show];
			const sortedSeasons = Object.keys(grouped[show].seasons)
				.map(Number)
				.sort((a, b) => a - b);

			for (const season of sortedSeasons) {
				sortedGrouped[show].seasons[season] = grouped[show].seasons[season].sort((a, b) => {
					const nameA = a.mediaInfo?.name || '';
					const nameB = b.mediaInfo?.name || '';
					return nameA.localeCompare(nameB);
				});
			}
		}

		return sortedGrouped;
	}

	function filterMovies() {
		const lowerFilter = filterText.toLowerCase();
		filteredMovies = Object.fromEntries(
			Object.entries(groupedMovies).filter(([showName]) =>
				showName.toLowerCase().includes(lowerFilter)
			)
		);
	}

	$: filterMovies();

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

<div class="filter">
	<input
		type="text"
		placeholder="Filter shows..."
		bind:value={filterText}
		on:input={filterMovies}
	/>
</div>

{#if Object.keys(filteredMovies).length}
	<section>
		{#each Object.entries(filteredMovies) as [showName, { poster, seasons }]}
			<div class="collapsible" on:click={() => toggleVisibility(visibleShows, showName)}>
				<img src={poster} alt={showName} class="poster" />
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
{:else}
	<p>No shows found.</p>
{/if}

<style>
	.filter {
		margin-bottom: 1rem;
	}

	.filter input {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
	}

	.collapsible {
		cursor: pointer;
		font-weight: bold;
		display: flex;
		align-items: center;
	}

	.show-poster {
		width: 3rem;
		height: auto;
		margin-right: 1rem;
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
		border: 1px solid var(--cover-art-border-color);
		margin: 2rem 1rem 0;
	}
</style>
