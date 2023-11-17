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
		<p>{post.summary}</p>
		<div class="image-container">
			<img src={post.image} alt="" border="0" style="display: block;" />
		</div>

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
	article {
		padding: 1.2rem;
	}
	article :global(h1) {
		font-size: 1.8rem;
		margin: 0.8rem 0;
	}

	article :global(h2) {
		font-size: 1.6rem;
		margin: .8rem 0;
	}

	article :global(h3) {
		font-size: 1.4rem;
		margin: .8rem 0;
	}

	article :global(h4) {
		font-size: 1.2rem;
		margin: .8rem 0;
	}

	article .tags {
		list-style-type: none;
		padding: 0;
	}

	article .tags li {
		display: inline-block;
		margin: .8rem;
	}

	article .tags li a {
		display: inline-block;
		text-decoration: none;
		background-color: #00f;
		color: #fff;
		/* move to theme */
		border: 1px solid #00f;
		border-radius: 10rem;
		padding: .8rem 1.2rem;
		min-width: 5rem;
		text-align: center;
	}

	.image-container {
		width: 51.2rem;
		height: 25.6rem;
		overflow: hidden;
		position: relative;
	}

	.image-container img {
		position: absolute;
		top: -50%;
		left: 0;
		width: 100%;
	}
</style>
