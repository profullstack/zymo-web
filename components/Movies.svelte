<script>
	export let movies = [];
</script>

{#if movies.length}
	<section>
		{#each movies as movie}
			<h1>{movie.title}</h1>
			<a href="/movies/{movie.id}">watch</a>
		{/each}
	</section>
{/if}
