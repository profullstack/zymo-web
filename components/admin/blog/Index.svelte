<script>
	export let posts = [];
	export let error = '';

	async function deletePost(postId) {
		try {
			const res = await fetch('/admin/blog/delete-post', {
				method: 'POST',
				body: JSON.stringify({ postId }),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.ok) {
				location.reload();
			} else {
				error = 'An error occured';
			}
		} catch (e) {
			error = 'An error occured';
		}
	}
</script>

<div>
	<h2>Manage blog posts</h2>
	<a href="/admin/blog/new-post">New Post</a>
	<br /><br />
	{#if error}
		{error}
	{/if}
	<div class="blog-list">
		{#each posts as post}
			<div class="blog-post">
				<a href="/blog/{post.slug}">
					<div class="post-thumbnail">
						{#if post.thumbnail}
							<img src={post.thumbnail} alt="Thumbnail" />
						{/if}
					</div>
				</a>

				<a href="/blog/{post.slug}"><h3>{post.title}</h3></a>
				<small class="post-excerpt">{post.excerpt}</small>
				<small> {post.views} {post.views !== 1 ? 'Views' : 'View'}</small>

				<div class="post-tags">
					{#each post.tags as tag}
						<a href="/blog/tag/{tag}"> {tag} </a>
					{/each}
				</div>

				<hr />
				<a href="/admin/blog/{post.id}">Edit post</a>
				<a href="/blog/{post.slug}">View post</a>
				<a href="#" on:click={() => deletePost(post.id)}>Delete Post</a>
				<hr />
			</div>
		{/each}
	</div>
	{#if !posts.length}
        <h3 style="color:gray">No posts yet</h3>
    {/if}
</div>

<style>
	.blog-list {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		justify-content: center;
	}
	.blog-post {
		width: 40rem;
	}
	.post-thumbnail {
		height: 20rem;
		background-color: gray;
	}
	.post-thumbnail img {
		height: 100%;
		width: 100%;
	}
	.post-excerpt {
		color: gray;
	}
	
	.post-tags {
		display: flex;
		gap: 0.5rem;
		margin: 1rem 0;
		font-size: small;
	}

	.post-tags a {
		color: gray !important;
	}
</style>
