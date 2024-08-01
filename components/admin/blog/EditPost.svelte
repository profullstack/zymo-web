<script>
	import { onMount } from 'svelte';
	export let post, error;

	let easymde;
	let tags = post.tags;
	let title = post.title;
	let thumbnail = post.thumbnail;

	let showThumbnail = true;

	onMount(() => {
		easymde = new EasyMDE({
			element: document.getElementById('markdownEditor')
		});

		easymde.value(post.markdown);
	});

	async function updatePost(e) {
		try {
			e.preventDefault();
			const markdown = easymde.value();
			const html = marked.parse(markdown);
			const excerpt = createExcerpt(html);

			const res = await fetch(`/admin/blog/${post.id}`, {
				method: 'POST',
				body: JSON.stringify({ title, thumbnail, markdown, html, excerpt, tags }),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.redirected) {
				window.location.replace(res.url);
				return;
			}
		} catch (e) {
			console.log('An error occured', e);
		}
	}

	function createExcerpt(html, length = 100) {
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = html;
		const textContent = tempDiv.textContent || tempDiv.innerText || '';

		if (textContent.length > length) {
			return textContent.substring(0, length) + '...';
		}

		return textContent;
	}

	function handleThumbnailUpload(event) {
		const file = event.target.files[0];
		if (file) {
			var reader = new FileReader();
			reader.onload = function () {
				thumbnail = reader.result;
			};
			reader.readAsDataURL(file);
		}
	}

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

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css" />
	<script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</svelte:head>
<div>
	<h2>Editing "{post.title}"</h2>
	{#if error}
		{error}
	{/if}
	<a href="/blog/{post.slug}">View post</a>
	<a href="#" on:click={() => deletePost(post.id)}>Delete Post</a>
	<form on:submit={updatePost}>
		<h4>Title</h4>
		<input bind:value={title} />
		<h4>Thumbnail</h4>
		<input on:change={handleThumbnailUpload} type="file" accept="image/*" />
		{#if thumbnail}
			<div>
				<a href="#" on:click={() => (showThumbnail = !showThumbnail)}>
					{showThumbnail ? 'Hide thumbnail' : 'Show thumbnail'}</a
				>
				<a href="#" on:click={() => (thumbnail = '')}>Remove thumbnail</a>
			</div>
		{/if}
		{#if showThumbnail && thumbnail}
			<img src={thumbnail} alt="Thumbnail" />
		{/if}
		<h4>Tags</h4>
		<input
			placeholder="Separate tags with a comma (,)"
			value={tags.join(', ')}
			on:input={(e) => (tags = e.target.value.split(',').map((v) => v.trim()))}
		/>

		<div class="tagsPreview">
			{#each tags as tag}
				<a href="/blog/tag/{tag}"> {tag} </a>
			{/each}
		</div>
		<h4>Body</h4>
		<textarea id="markdownEditor"> </textarea>
		<button type="submit">Update</button>
	</form>
	<style>
		i {
			color: black !important;
		}
	</style>
</div>

<style>
	form {
		width: 100%;
	}

	.tagsPreview {
		display: flex;
		gap: 0.7rem;
		padding: 0.5rem;
	}
</style>
