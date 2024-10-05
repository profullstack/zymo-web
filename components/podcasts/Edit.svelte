<script>
	export let podcast, status, errors;

	async function submit(e) {
		e.preventDefault();

		console.log(podcast);
		const res = await fetch(`/podcasts/show/${podcast.id}`, {
			method: 'PUT',
			body: JSON.stringify(podcast),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const result = await res.json();

		status = result.status;

		console.log(result);
	}
</script>

<h1>Edit Podcast Show</h1>

{#if podcast}
	<form on:submit={submit}>
		{status ?? ''}
		<div><input name="url" placeholder="Enter RSS Feed url" required bind:value={podcast.url} /></div>
		<div>{errors?.url ?? ''}</div>
		<div><button type="submit">Update</button></div>
	</form>
{/if}
