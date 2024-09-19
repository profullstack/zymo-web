<script>
	export let xtream, status, errors;

	async function submit(e) {
		e.preventDefault();

		console.log(xtream);
		const res = await fetch(`/xtream/stream/${xtream.id}`, {
			method: 'PUT',
			body: JSON.stringify(xtream),
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
	<div><input name="name" placeholder="Enter name" required bind:value={xtream.name} /></div>
	<div>{errors?.name ?? ''}</div>
	<div><input name="url" placeholder="Enter url" required bind:value={xtream.url} /></div>
	<div>{errors?.url ?? ''}</div>
	<div><input name="username" placeholder="Enter username" required bind:value={xtream.username} /></div>
	<div>{errors?.username ?? ''}</div>
	<div><input name="password" type="password" placeholder="Enter password" required bind:value={xtream.password} /></div>
	<div>{errors?.password ?? ''}</div>
	<div><button type="submit"> Update </button></div>
</form>
