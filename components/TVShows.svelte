<script>
	export let shows = [];

	let filterText = '';
	let groupedShows = groupAndSortShows(shows);
	let filteredShows = groupedShows;

	// Function to group and sort shows by show name and optionally by season
	function groupAndSortShows(shows) {
		const grouped = {};

		for (const show of shows) {
			const showName = show.mediaInfo?.name || 'Unknown Show';
			const videoType = show.mediaInfo?.videoType || 'tv show';
			const season = videoType === 'tv show' ? show.mediaInfo?.season || 0 : null;
			const episode = show.mediaInfo?.episode || 0;

			if (!grouped[showName]) {
				grouped[showName] = {
					poster: show.omdb?.Poster || '/static/icons/placeholder.movie.svg',
					seasons: {}
				};
			}
			if (season !== null) {
				if (!grouped[showName].seasons[season]) {
					grouped[showName].seasons[season] = [];
				}
				grouped[showName].seasons[season].push({ ...show, episode });
			} else {
				if (!grouped[showName].seasons[0]) {
					grouped[showName].seasons[0] = [];
				}
				grouped[showName].seasons[0].push({ ...show, episode });
			}
		}

		// Sort shows, seasons, and episodes
		const sortedGrouped = {};
		const sortedShows = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

		for (const show of sortedShows) {
			sortedGrouped[show] = grouped[show];
			const sortedSeasons = Object.keys(grouped[show].seasons)
				.map(Number)
				.sort((a, b) => a - b);

			for (const season of sortedSeasons) {
				sortedGrouped[show].seasons[season] = grouped[show].seasons[season].sort((a, b) => {
					// Sort by episode number
					return (a.episode || 0) - (b.episode || 0);
				});
			}
		}

		return sortedGrouped;
	}

	function filterShows() {
		const lowerFilter = filterText.toLowerCase();
		filteredShows = Object.fromEntries(
			Object.entries(groupedShows).filter(([showName]) =>
				showName.toLowerCase().includes(lowerFilter)
			)
		);
	}

	$: filterShows();

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
		on:input={filterShows}
	/>
</div>

{#if Object.keys(filteredShows).length}
	<section>
		{#each Object.entries(filteredShows) as [showName, { poster, seasons }]}
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
									{#each episodes as show}
										<div class="show">
											<a href="/tv/{show.id}">watch</a>
											<a href={show.url}>
												{show.mediaInfo?.name || 'Unknown Name'}
												{#if show.mediaInfo?.episode}(Episode {show
														.mediaInfo.episode}){/if} - ({show.fileExt})
											</a>
										</div>
									{/each}
								</div>
							{/if}
						{:else}
							{#each episodes as show}
								<div class="show">
									<a href="/tv/{show.id}">watch</a>
									<a href={show.url}>
										{show.mediaInfo?.name ||
											'Unknown Name'}{#if show.mediaInfo?.episode}(Episode {show
												.mediaInfo.episode}){/if}
										- ({show.fileExt})
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

	.show {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding-left: 1em;
		margin: 2rem 0;
	}

	.show a {
		margin-left: 1em;
	}

	.poster {
		width: 6rem;
		height: auto;
		border: 1px solid var(--cover-art-border-color);
		margin: 2rem 1rem 0;
	}
</style>
