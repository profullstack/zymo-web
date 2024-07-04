<script>
	export let payouts;
</script>

<div>
	<h2>Recent Payouts</h2>
	{#if payouts.length}
		{#each payouts as payout}
			<div style="padding: 1rem; border: 0.1rem solid black; border-radius: 0.5rem;">
				{#if payout.amount}<h3>$ {payout.amount}</h3>
				{/if}
				<p>Payout Method: {payout.method}</p>
				<p>Created: {new Date(payout.createdAt).toLocaleString()} UTC</p>
				<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
					{#if payout.method == 'bank'}
						<p><b>Account category:</b> {payout.details.accountCategory}</p>
						<p><b>Account type:</b> {payout.details.accountType}</p>
						<p><b>Routing number:</b> {payout.details.routingNumber}</p>
						<p><b>Account number:</b> {payout.details.accountNumber}</p>
						<p><b>Account name:</b> {payout.details.accountName}</p>
					{/if}
					{#if payout.method == 'cryptocurrency'}
						<p><b>Coin</b>: {payout.details.coin}</p>
						<p><b>Address</b>: {payout.details.address}</p>
					{/if}
				</div>
			</div>
			<br /><br />
		{/each}
	{:else}
		<div>No payouts yet</div>
	{/if}
</div>
