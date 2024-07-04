<script>
	export let affiliates;

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2
	});
</script>

<div>
	<h2>Affiliates</h2>
	<table>
		<tr>
			<th>#</th>
			<th>Email</th>
			<th>Balance</th>
			<th>Payout Methods</th>
			<th>Actions</th>
		</tr>
		{#each affiliates as affiliate, index}
			<tr>
				<td>{index + 1}</td>
				<td>{affiliate.userInfo.email}</td>
				<td>{currencyFormatter.format(affiliate.balance)}</td>
				<td>{affiliate.payoutMethods.length}</td>
				<td>
					<a href="/admin/affiliates/payout/{affiliate.id}">Payout</a>
				</td>
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
