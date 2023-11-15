<script>
	export let posts = [];
</script>

<section class="blog-idx">
	<h1>Blog</h1>

	{#if posts.length}
		<ul>
			{#each posts as post}
				<li>
					<a href="/blog/{post.slug}"
						><img src={post.thumbnail} alt="" style="width: 20rem; display: block;" />
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

    .blog-idx > ul > li {
        width: 22rem;
    }
</style>
