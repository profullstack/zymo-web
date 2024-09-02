<script>
	export let users = [];

	console.log(users, '<< users');

	let msg = '';

	function exportAsCSV() {
		const headers = [
			'#',
			'First Name',
			'Last Name',
			'Email Address',
			'Phone Number',
			'Host',
			'Created At'
		];
		const rows = users.map((user, index) => [
			index + 1,
			user.firstName,
			user.lastName,
			user.email,
			user.phonePrefix + user.phone,
			(user.headers && user.headers.host) || '',
			user.createdAt
		]);

		console.log(rows, '<< rows');
		const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'users.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function deleteUser(user, index) {
		const url = `/admin/db/users/${user.id}/delete`;
		try {
			const res = await fetch(url, {
				method: 'DELETE'
			});

			const data = await res.json();
			msg = data.message;

			document.getElementById('user-' + index).remove();
		} catch (err) {
			console.error(err);
		}
	}
</script>

<div>
	<h2>Users</h2>
	<button on:click={exportAsCSV}>Export as CSV</button>

	{#if msg}<pre>{JSON.stringify(msg, null, 2)}</pre>{/if}
	<table>
		<thead>
			<tr>
				<th>#</th>
				<th>First Name</th>
				<th>Last Name</th>
				<th>Email Address</th>
				<th>Phone</th>
				<th>Real IP</th>
				<th>Forwarded IP</th>
				<th>Created At</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each users as user, index}
				<tr id="user-{index}">
					<td>{index + 1}</td>
					<td>{user.firstName}</td>
					<td>{user.lastName}</td>
					<td>{user.email}</td>
					<td>{user.phonePrefix + user.phone}</td>
					<td>{(user.headers && user.headers['x-real-ip']) || ''}</td>
					<td>{(user.headers && user.headers['x-forwarded-for']) || ''}</td>
					<td>{user.createdAt}</td>
					<td
						><a
							href="#"
							on:click|preventDefault={() => {
								deleteUser(user, index);
							}}>delete</a
						></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table {
		width: 100%;
		text-align: center;
	}
	tbody tr:hover {
		background-color: var(--tbody-tr-hover-background-color);
	}
</style>
