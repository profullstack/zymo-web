<script>
	export let library, status, errors;

	async function submit(e) {
		e.preventDefault();

		console.log(library);
		const res = await fetch(`/library/${library.id}`, {
			method: 'PUT',
			body: JSON.stringify(library),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const result = await res.json();

		status = result.status;

		console.log(result);
	}
</script>

<h1>Edit Library URL</h1>

<form on:submit={submit}>
	{status ?? ''}
	<div><input name="url" placeholder="Enter url" required bind:value={library.url} /></div>
	<div>{errors?.url ?? ''}</div>
	<div><input name="name" placeholder="Enter name" required bind:value={library.name} /></div>
	<div>{errors?.name ?? ''}</div>
	<h4>For basic auth (optional):</h4>
	<div><input name="user" placeholder="Enter username" bind:value={library.user} /></div>
	<div>{errors?.user ?? ''}</div>
	<div>
		<input
			name="pass"
			type="password"
			placeholder="Enter password"
			bind:value={library.pass}
		/>
	</div>
	<div>{errors?.pass ?? ''}</div>
	<div><button type="submit">Update</button></div>
</form>
