<script>
	export let client, status, errors;

	async function submit(e) {
		e.preventDefault();

		console.log(client);
		const res = await fetch(`/torrent/${client.id}`, {
			method: 'PUT',
			body: JSON.stringify(client),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const result = await res.json();

		status = result.status;

		console.log(result);
	}
</script>

<h1>Edit Torrent Client</h1>

<form on:submit={submit}>
	{status ?? ''}
	<div><input name="url" placeholder="Enter url" required bind:value={client.url} /></div>
	<div>{errors?.url ?? ''}</div>
	<div><input name="name" placeholder="Enter name" required bind:value={client.name} /></div>
	<div>{errors?.name ?? ''}</div>
	<h4>For basic auth (optional):</h4>
	<div><input name="user" placeholder="Enter username" bind:value={client.user} /></div>
	<div>{errors?.user ?? ''}</div>
	<div>
		<input name="pass" type="password" placeholder="Enter password" bind:value={client.pass} />
	</div>
	<div>{errors?.pass ?? ''}</div>
	<div>
		<select name="provider" bind:value={client.provider}>
			<option value="deluge" selected={client.provider === 'deluge'}>Deluge</option>
			<option value="qbittorrent" selected={client.provider === 'qbittorrent'}
				>QBittorent</option
			>
			<option value="rtorrent" selected={client.provider === 'rtorrent'}>RTorrent</option>
			<option value="transmission" selected={client.provider === 'transmission'}
				>Transmission</option
			>
		</select>
	</div>
	<div>{errors?.provider ?? ''}</div>
	<div><button type="submit">Update</button></div>
</form>
