<script>
	export let movies = [];
</script>

{#if movies.length}
	<section>
		{#each movies as movie}
			<div class="movie">
				<a href="/movies/{movie.id}">watch</a>
				<a href={movie.url}>{movie.title}</a>
			</div>
		{/each}
	</section>
{/if}
