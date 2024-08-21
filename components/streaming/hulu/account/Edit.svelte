<script>
	export let hulu, status, errors;

	async function submit(e) {
		e.preventDefault();

		console.log(mlb);
		const res = await fetch(`/streaming/hulu/account/${hulu.id}`, {
			method: 'PUT',
			body: JSON.stringify(mlb),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const result = await res.json();

		status = result.status;

		console.log(result);
	}
</script>

<h1>Edit Hulu Account</h1>

<form on:submit={submit}>
	{status ?? ''}
	<div><input name="username" placeholder="Enter username" bind:value={hulu.username} /></div>
	<div>{errors?.username ?? ''}</div>
	<div>
		<input
			name="password"
			placeholder="Enter password"
			type="password"
			bind:value={hulu.password}
		/>
	</div>
	<div>{errors?.password ?? ''}</div>
	<div><button type="submit"> Update </button></div>
</form>
