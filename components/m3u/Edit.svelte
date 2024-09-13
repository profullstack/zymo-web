<script>
	export let m3u, status, errors;

	async function submit(e) {
		e.preventDefault();

		console.log(m3u);
		const res = await fetch(`/live/stream/${m3u.id}`, {
			method: 'PUT',
			body: JSON.stringify(m3u),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const result = await res.json();

		status = result.status;

		console.log(result);
	}
</script>

<h1>Edit M3U list</h1>

<form on:submit={submit}>
	{status ?? ''}
	<div><input name="url" placeholder="Enter url" required bind:value={m3u.url} /></div>
	<div>{errors?.url ?? ''}</div>
	<div><input name="name" placeholder="Enter name" required bind:value={m3u.name} /></div>
	<div>{errors?.m3u ?? ''}</div>
	<div><input name="epg" placeholder="Enter EPG url" bind:value={m3u.epg} /></div>
	<div>{errors?.epg ?? ''}</div>
	<div><button type="submit"> Update </button></div>
</form>
