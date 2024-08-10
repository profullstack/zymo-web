<script>
	export let shows = [];

	// Function to group and sort shows by show name and optionally by season
	function groupAndSortShows(shows) {
		const grouped = {};

		for (const show of shows) {
			const showName = show.mediaInfo?.name || 'Unknown Show';
			const videoType = show.mediaInfo?.videoType || 'tv show';
			const season = videoType === 'tv show' ? show.mediaInfo?.season || 0 : null;
			const id = show.id;

			console.log(show, '<<<< show');

			if (!grouped[showName]) {
				grouped[showName] = {};
			}
			if (season !== null) {
				if (!grouped[showName][season]) {
					grouped[showName][season] = [];
				}
				grouped[showName][season].push({ ...show });
			} else {
				if (!grouped[showName][0]) {
					grouped[showName][0] = [];
				}
				grouped[showName][0].push({ ...show });
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

	let groupedshows = groupAndSortShows(shows);

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

{#if Object.keys(groupedshows).length}
	<section>
		{#each Object.entries(groupedshows) as [showName, seasons]}
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
									{#each episodes as show}
										<div class="show">
											{#if show.omdb}
												<img class="poster" src={show.omdb.Poster} alt="" />
											{/if}
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
									<pre>{JSON.stringify(show, null, 2)}</pre>
									{#if show.omdb}
										<img class="poster" src={show.omdb.Poster} alt="" />
									{/if}
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
{/if}

<style>
	.collapsible {
		cursor: pointer;
		font-weight: bold;
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
		border: 1px solid var(--button-border-color);
	}
</style>
