<script>
	export let movie = {};
	export let proxy = false;

	const { user, pass, file } = movie;
	const type = file.split('.').pop();

	let url = movie.url;

	if (proxy) {
		if (user && pass) {
			url = `/proxy?user=${user}&pass=${pass}&url=${encodeURIComponent(movie.url)}`;
		} else {
			url = `/proxy?url=${encodeURIComponent(movie.url)}`;
		}
	}
</script>

{#if url}
	<section>
		<h1><a href={movie.url}>{movie.title}</a></h1>
		<video controls autoplay>
			<source src={url} type="video/{type}" />
		</video>
	</section>
{/if}
