<script>
	export let posts = [];
	export let tag = '';

	const title = `${tag.split('-').join(' ')} blog posts`.trim();
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<section class="blog-idx">
	<h1>{title}</h1>

	{#if posts.length}
		<ul>
			{#each posts as post}
				<li>
					<a href="/blog/{post.slug}"
						><img src={post.thumbnail} alt="" />
						{post.title}</a
					>
					<p>{post.summary.slice(0, 200)}...</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Come back later, no posts yet.</p>
	{/if}
</section>

<style>
	.blog-idx ul {
		list-style-type: none;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-wrap: wrap;
		flex-direction: row;
		gap: 1rem;
		padding: 0;
		margin: 0;
	}

	.blog-idx img {
		display: block;
		width: 20rem;
	}

	.blog-idx > ul > li {
		width: 22rem;
	}

	@media only screen and (max-width: 767px) {
		.blog-idx ul {
			gap: 0;
		}

		.blog-idx > ul > li {
			width: 100%;
		}

		.blog-idx img {
			width: 100%;
		}
	}
</style>
