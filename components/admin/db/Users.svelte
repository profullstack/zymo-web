<script>
	import Spinner from '../../Spinner.svelte';
	export let users = [];

	console.log(users, '<< users');

	let msg = '';
	let isLoading = {};

	let selectedIds = [];
	let lastCheckedIndex = null;
	let bulkAction = '';

	// Sorting variables
	let sortColumn = '';
	let sortDirection = 1; // 1 for ascending, -1 for descending
	let sortedUsers = [];

	const columns = [
		{
			name: 'index',
			label: '#',
			accessor: (user, index) => index + 1,
			type: 'number'
		},
		{
			name: 'firstName',
			label: 'First Name',
			accessor: (user) => user.firstName,
			type: 'string'
		},
		{
			name: 'lastName',
			label: 'Last Name',
			accessor: (user) => user.lastName,
			type: 'string'
		},
		{
			name: 'email',
			label: 'Email Address',
			accessor: (user) => user.email,
			type: 'string'
		},
		{
			name: 'phone',
			label: 'Phone',
			accessor: (user) => user.phonePrefix + user.phone,
			type: 'string'
		},
		{
			name: 'realIp',
			label: 'Real IP',
			accessor: (user) => (user.headers && user.headers['x-real-ip']) || '',
			type: 'string'
		},
		{
			name: 'forwardedIp',
			label: 'Forwarded IP',
			accessor: (user) => (user.headers && user.headers['x-forwarded-for']) || '',
			type: 'string'
		},
		{
			name: 'stripeCustomerId',
			label: 'Stripe Customer ID',
			accessor: (user) => user.stripeCustomerId || '',
			type: 'string'
		},
		{
			name: 'subscriptionStatus',
			label: 'Subscription Status',
			accessor: (user) => user.payments.map((payment) => payment.status).join(', ') || '',
			type: 'string'
		},
		{
			name: 'createdAt',
			label: 'Created At',
			accessor: (user) => user.createdAt,
			type: 'date'
		},
		{
			name: 'verifiedEmail',
			label: 'Verified Email',
			accessor: (user) => user.verify?.email.status || 'n/a',
			type: 'string'
		}
	];

	function exportAsCSV() {
		const headers = columns.map((col) => col.label);
		const rows = sortedUsers.map((user, index) =>
			columns.map((col) => col.accessor(user, index))
		);

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
		isLoading[user.id] = true;
		const url = `/admin/db/users/${user.id}/delete`;
		try {
			const res = await fetch(url, {
				method: 'DELETE'
			});

			const data = await res.json();
			msg = data.message;

			// Remove user from the users array
			users = users.filter((u) => u.id !== user.id);

			// Remove user id from selectedIds if present
			selectedIds = selectedIds.filter((id) => id !== user.id);

			// Svelte will update the UI automatically
		} catch (err) {
			console.error(err);
		} finally {
			isLoading[user.id] = false;
		}
	}

	function handleCheckboxClick(event, index) {
		const id = sortedUsers[index].id;
		const checked = event.target.checked;
		if (event.shiftKey && lastCheckedIndex !== null) {
			const start = Math.min(index, lastCheckedIndex);
			const end = Math.max(index, lastCheckedIndex);
			for (let i = start; i <= end; i++) {
				const uid = sortedUsers[i].id;
				if (checked && !selectedIds.includes(uid)) {
					selectedIds = [...selectedIds, uid];
				} else if (!checked && selectedIds.includes(uid)) {
					selectedIds = selectedIds.filter((id) => id !== uid);
				}
			}
		} else {
			if (checked) {
				if (!selectedIds.includes(id)) {
					selectedIds = [...selectedIds, id];
				}
			} else {
				selectedIds = selectedIds.filter((sid) => sid !== id);
			}
		}
		lastCheckedIndex = index;
	}

	function toggleSelectAll(event) {
		const checked = event.target.checked;
		if (checked) {
			selectedIds = sortedUsers.map((user) => user.id);
		} else {
			selectedIds = [];
		}
	}

	async function performBulkAction() {
		if (bulkAction === 'delete') {
			try {
				const res = await fetch('/admin/db/users/mass/delete', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ids: selectedIds })
				});
				const data = await res.json();
				msg = data.message;

				// Remove deleted users from the users array
				users = users.filter((user) => !selectedIds.includes(user.id));
				selectedIds = [];
				bulkAction = '';
			} catch (err) {
				console.error(err);
			}
		}
	}

	function sortUsers(columnName) {
		if (sortColumn === columnName) {
			// If already sorting on this column, reverse the direction
			sortDirection *= -1;
		} else {
			// Sort on new column, default to ascending
			sortColumn = columnName;
			sortDirection = 1;
		}
	}

	// Reactive statement to sort users
	$: {
		if (sortColumn) {
			const column = columns.find((col) => col.name === sortColumn);
			sortedUsers = [...users].sort((a, b) => {
				let aValue = column.accessor(a);
				let bValue = column.accessor(b);

				// Handle undefined or null values
				if (aValue === undefined || aValue === null) aValue = '';
				if (bValue === undefined || bValue === null) bValue = '';

				// Handle comparison based on type
				switch (column.type) {
					case 'number':
						aValue = Number(aValue);
						bValue = Number(bValue);
						return (aValue - bValue) * sortDirection;
					case 'date':
						aValue = new Date(aValue);
						bValue = new Date(bValue);
						return (aValue - bValue) * sortDirection;
					case 'string':
					default:
						aValue = aValue.toString().toLowerCase();
						bValue = bValue.toString().toLowerCase();
						if (aValue < bValue) return -1 * sortDirection;
						if (aValue > bValue) return 1 * sortDirection;
						return 0;
				}
			});
		} else {
			sortedUsers = users;
		}
	}
</script>

<div>
	<h2>Users</h2>
	<button on:click={exportAsCSV}>Export as CSV</button>

	<div>
		<select bind:value={bulkAction}>
			<option value="">Bulk Actions</option>
			<option value="delete">Delete Selected</option>
		</select>
		<button on:click={performBulkAction} disabled={selectedIds.length === 0 || !bulkAction}
			>Apply</button
		>
	</div>

	{#if msg}<pre>{JSON.stringify(msg, null, 2)}</pre>{/if}
	<table>
		<thead>
			<tr>
				<th><input type="checkbox" on:change={toggleSelectAll} /></th>
				{#each columns as column}
					<th on:click={() => sortUsers(column.name)}>
						{column.label}
						{#if sortColumn === column.name}
							{sortDirection === 1 ? '▲' : '▼'}
						{/if}
					</th>
				{/each}
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each sortedUsers as user, index}
				<tr id="user-{index}">
					<td>
						<input
							type="checkbox"
							checked={selectedIds.includes(user.id)}
							on:click={(event) => handleCheckboxClick(event, index)}
						/>
					</td>
					{#each columns as column}
						<td>
							{column.accessor(user, index)}
						</td>
					{/each}
					<td>
						<a
							href="#delete"
							on:click|preventDefault={() => {
								deleteUser(user, index);
							}}
						>
							delete
							{#if Boolean(isLoading[user.id])}
								<span class="spinner">
									<Spinner
										isLoading={Boolean(isLoading[user.id])}
										color="black"
									/>
								</span>
							{/if}
						</a>
					</td>
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
	th {
		cursor: pointer;
	}
	th:hover {
		background-color: #f1f1f1;
	}
	a[href='#delete'] {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}
	a[href='#delete'] span {
		margin-right: 0.8rem;
	}
	/* Optional styling for sort indicators */
	th {
		position: relative;
	}
	th::after {
		content: '';
		position: absolute;
		right: 8px;
		font-size: 0.8em;
	}
	th[sort-direction='1']::after {
		content: '▲';
	}
	th[sort-direction='-1']::after {
		content: '▼';
	}
</style>
