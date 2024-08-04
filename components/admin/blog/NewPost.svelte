<script>
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	export let error;

	let easymde, title, thumbnail, thumbnailPreview;
	let tags = [];
	let showThumbnail = true;

	onMount(() => {
		easymde = new EasyMDE({
			element: document.getElementById('markdownEditor')
		});
	});

	async function createPost(e) {
		try {
			e.preventDefault();
			const markdown = easymde.value();
			const html = marked.parse(markdown);
			const excerpt = createExcerpt(html);

			const formData = new FormData();
			formData.append('title', title);
			formData.append('markdown', markdown);
			formData.append('excerpt', excerpt);
			formData.append('tags', JSON.stringify(tags));
			formData.append('thumbnail', thumbnail);

			const res = await fetch('/admin/blog/new-post', {
				method: 'POST',
				body: formData
			});

			if (res.redirected) {
				window.location.replace(res.url);
				return;
			}
		} catch (e) {
			error = 'An error occurred';
			console.log('An error occurred', e);
		}
	}

	function createExcerpt(html, length = 200) {
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
			thumbnail = file;
			var reader = new FileReader();
			reader.onload = function () {
				thumbnailPreview = reader.result;
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css" />
	<script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>
</svelte:head>
<div>
	<h2>New blog post</h2>
	{#if error}
		{error}
	{/if}
	<form on:submit={createPost}>
		<h4>Title</h4>
		<input bind:value={title} />
		<h4>Thumbnail</h4>
		<input on:change={handleThumbnailUpload} type="file" accept="image/*" />
		{#if thumbnailPreview}
			<div>
				<a href="#" on:click={() => (showThumbnail = !showThumbnail)}>
					{showThumbnail ? 'Hide thumbnail' : 'Show thumbnail'}</a
				>
				<a href="#" on:click={() => (thumbnail = thumbnailPreview = '')}>Remove thumbnail</a
				>
			</div>
		{/if}
		{#if showThumbnail && thumbnailPreview}
			<img src={thumbnailPreview} alt="Thumbnail" />
		{/if}
		<h4>Tags</h4>
		<input
			placeholder="Separate tags with a comma (,)"
			on:input={(e) => (tags = e.target.value.split(',').map((v) => v.trim()))}
		/>

		<div class="tagsPreview">
			{#each tags as tag}
				<a href="/blog/tag/{tag}"> {tag} </a>
			{/each}
		</div>
		<h4>Body</h4>
		<textarea id="markdownEditor"> </textarea>
		<button type="submit">Post</button>
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
