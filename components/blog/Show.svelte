<script>
	export let post;
	export let html;

	let formatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		hour12: true // Use 12-hour format with AM/PM
	});
</script>

<svelte:head>
	<title>{post.title}</title>
</svelte:head>

{#if post}
	<article>
		<h1>{post.title}</h1>
		<div>By {post.author} on {formatter.format(new Date(post.createdAt))}</div>
		<img src={post.image} alt="" border="0" style="display: block;" />

		{@html html}

		<h4>Topics</h4>
		<ul class="tags">
			{#each post.tags as tag}
			<li><a href="/blog/tag/{tag}">{tag}</a></li>
			{/each}
		</ul>
	</article>
{/if}

<style>
	article h1 {
		margin-bottom: 0.2rem;
	}

	article .tags {
		list-style-type: none;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1rem;
	}
</style>
