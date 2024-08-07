<script>
	export let movies = [];

	for (let movie of movies) {
		try {
			movie.humanTitle = movie.mediaInfo
				? movie.mediaInfo.name
				: decodeURIComponent(movie.title);
		} catch (err) {
			console.error(err, movie.mediaInfo.name);
			movie.humanTitle = movie.title;
		}

		try {
			movie.humanPath = decodeURIComponent(movie.path);
		} catch (err) {
			movie.humanPath = movie.path;
		}
	}
</script>

{#if movies.length}
	<section>
		{#each movies as movie}
			<div class="movie">
				<a href="/movies/{movie.id}">watch</a>
				<a href={movie.url}
					>{movie.humanPath.split('/').join(' / ')} / {movie.humanTitle}.{movie.fileExt}</a
				>
				{#if movie.mediaInfo}
					<!-- {#each Object.entries(movie.mediaInfo) as [key, value]}
						<span>{key}: {value}</span>
					{/each} -->
				{/if}
			</div>
		{/each}
	</section>
{/if}

<style>
	.movie span {
		margin-right: 0.8rem;
	}
</style>
