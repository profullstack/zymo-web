<script>
	export let payoutMethod, error;
	let availableCryptoOptions = ['BTC', 'ETH', 'DOGE'];
</script>

<div>
	<h4>Edit Payout Method</h4>

	{#if error}
		<div style="color: red;">{error}</div>
	{/if}
	{#if payoutMethod.method == 'bank'}
		<form style="margin: 1rem 0;" method="post">
			<p>Account category</p>
			<label>
				<input
					type="radio"
					checked={payoutMethod.details.accountCategory == 'checking'}
					name="accountCategory"
					value="checking"
				/>
				Checking
			</label>
			<label>
				<input
					type="radio"
					checked={payoutMethod.details.accountCategory == 'savings'}
					name="accountCategory"
					value="savings"
				/>
				Savings
			</label>
			<p>Account type</p>
			<label>
				<input
					type="radio"
					checked={payoutMethod.details.accountType == 'business'}
					name="accountType"
					value="business"
				/>
				Business
			</label>
			<label>
				<input
					type="radio"
					checked={payoutMethod.details.accountType == 'personal'}
					name="accountType"
					value="personal"
				/>
				Personal
			</label>
			<br /><br />
			<input
				required
				value={payoutMethod.details.routingNumber}
				name="routingNumber"
				placeholder="Routing number"
			/>
			<br /><br />
			<input
				required
				value={payoutMethod.details.accountNumber}
				name="accountNumber"
				placeholder="Account number"
			/>
			<br /><br />
			<input
				required
				value={payoutMethod.details.accountName}
				name="accountName"
				placeholder="Account name"
			/>
			<br /><br />
			<button>Save</button>
		</form>
	{/if}
	{#if payoutMethod.method == 'cryptocurrency'}
		<form style="margin: 1rem 0;" method="post">
			<label>
				Coin:
				<select name="coin" required>
					{#each availableCryptoOptions as option}
						<option selected={payoutMethod.details.coin == option} value={option}
							>{option}</option
						>
					{/each}
				</select>
			</label>
			<br /><br />
			<input
				required
				value={payoutMethod.details.address}
				name="address"
				placeholder="Address"
			/>
			<br /><br />
			<button>Save</button>
		</form>
	{/if}
</div>
