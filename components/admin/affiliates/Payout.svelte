<script>
	export let affiliate, error, message;

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2
	});
</script>

<div>
	<h2>Make Payout</h2>

	<p>Name: {affiliate.userInfo.firstName} {affiliate.userInfo.lastName}</p>
	<p>Email: {affiliate.userInfo.email}</p>
	<p>Balance: {currencyFormatter.format(affiliate.balance)}</p>

	<br />
	<h3>Payout Info</h3>
	{#if error}
		<div style="color: red;">{error}</div>
	{/if}
	{#if message}
		<div style="color: green;">{message}</div>
	{/if}
	<form method="post">
		<input type="number" name="amount" placeholder="Amount" />
		<br />
		<p>Payout Method</p>
		{#each affiliate.payoutMethods as payoutMethod}
			<label class="payoutMethod">
				<input type="radio" name="payoutMethodId" value={payoutMethod.id} />
				<div class="details">
					{#if payoutMethod.method == 'bank'}
						<p><b>Account category:</b> {payoutMethod.details.accountCategory}</p>
						<p><b>Account type:</b> {payoutMethod.details.accountType}</p>
						<p><b>Routing number:</b> {payoutMethod.details.routingNumber}</p>
						<p><b>Account number:</b> {payoutMethod.details.accountNumber}</p>
						<p><b>Account name:</b> {payoutMethod.details.accountName}</p>
					{/if}
					{#if payoutMethod.method == 'cryptocurrency'}
						<p><b>Coin</b>: {payoutMethod.details.coin}</p>
						<p><b>Address</b>: {payoutMethod.details.address}</p>
					{/if}
				</div>
			</label>
			<br />
		{/each}
		<br />
		<button>Payout</button>
	</form>
</div>

<style>
	.payoutMethod {
		display: flex;
		gap: 1rem;
		border: 1px solid black;
		padding: 0.5rem;
		border-radius: 1rem;
		align-items: center;
	}
	.payoutMethod input {
		outline: none;
		border: none;
	}
	.payoutMethod > .details {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}
</style>
