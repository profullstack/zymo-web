<script>
	export let movies = [];

	for (let movie of movies) {
		try {
			movie.humanTitle = decodeURIComponent(movie.title);
		} catch (err) {
			console.error(err, movie.title);
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
				<a href={movie.url}>{movie.humanPath}/{movie.humanTitle}.{movie.fileExt}</a>
			</div>
		{/each}
	</section>
{/if}
