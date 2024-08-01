<script>
	export let post;
</script>

<div>
	<h1>{post.title}</h1>

	{#if post.thumbnail}
		<img class="thumbnail" src={post.thumbnail} alt="Thumbnail" />
	{/if}

	<p>last updated on <b>{new Date(post.updatedAt).toDateString()}</b></p>

	<p>author: <b>{post.authorName}</b></p>

	<small>{post.views} {post.views !== 1 ? 'Views' : 'View'}</small>
	<hr />
	<div>
		{@html post.html}
	</div>
	<hr />
	<div class="tags">
		{#each post.tags as tag}
			<a href="/blog/tag/{tag}"> {tag} </a>
		{/each}
	</div>
</div>

<style>
	.thumbnail {
		max-width: 100%;
	}
	.tags {
		display: flex;
		gap: 0.7rem;
		padding: 0.5rem;
	}
</style>
