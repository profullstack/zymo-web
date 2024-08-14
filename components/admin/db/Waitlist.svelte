<script>
	export let waitlist = [];

	function exportAsCSV() {
		const headers = ['#', 'Email'];
		const rows = waitlist.map((user, index) => [index + 1, user.email]);
		const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'waitlist.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div>
	<h2>Waitlist</h2>
	<button on:click={exportAsCSV}>Export as CSV</button>
	<table>
		<tr>
			<th>#</th>
			<th>Email address</th>
			<th>Created At</th>
		</tr>
		{#each waitlist as user, index}
			<tr>
				<td>{index + 1}</td>
				<td>{user.email}</td>
				<td>{user.createdAt}</td>
			</tr>
		{/each}
	</table>
</div>

<style>
	table {
		width: 100%;
		text-align: center;
	}
</style>
