<script>
	export let movie = {};

	const { user, pass } = movie;
	const proxy = false;
	const url = proxy
		? `/proxy?user=${user}&pass=${pass}&url=${encodeURIComponent(movie.url)}`
		: movie.url;
	const type = movie.file.split('.').pop();
</script>

{#if url}
	<section>
		<h1><a href={movie.url}>{movie.title}</a></h1>
		<video controls autoplay>
			<source src={url} type="video/{type}" />
		</video>
	</section>
{/if}
