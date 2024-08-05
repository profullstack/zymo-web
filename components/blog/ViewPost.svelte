<script>
	import { marked } from 'marked';

	export let post;
	export let isAdmin = false;
	let html = '';

	try {
		html = marked.parse(post.markdown);
	} catch (e) {}
</script>

<svelte:head>
	<title>{post.title}</title>
</svelte:head>

<div>
	<h1>{post.title}</h1>

	{#if post.thumbnail}
		<img class="thumbnail" src={post.thumbnail} alt="Thumbnail" />
	{/if}

	<p>last updated on <b>{new Date(post.updatedAt).toDateString()}</b></p>

	<p>author: <b>{post.authorName}</b></p>

	<small>{post.views} {post.views !== 1 ? 'Views' : 'View'}</small>
	{#if isAdmin}
		<a href="/admin/blog/{post.id}">Edit post</a>
	{/if}
	<hr />
	<div>
		{@html html}
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
