<script>
	export let error;
	let payoutMethod = 'bank';
	let availableCryptoOptions = ['BTC', 'ETH', 'DOGE'];
</script>

<div>
	<h2>Add Payout Method</h2>

	<label>
		Method:
		<select bind:value={payoutMethod}>
			<option value="bank">Bank</option>
			<option value="cryptocurrency">Cryptopcurrency</option>
		</select>
	</label>

	<h4>Details</h4>
	{#if error}
		<div style="color: red;">{error}</div>
	{/if}
	{#if payoutMethod == 'bank'}
		<form style="margin: 1rem 0;" method="post">
			<input name="method" value={payoutMethod} hidden />
			<p>Account category</p>
			<label>
				<input type="radio" checked name="accountCategory" value="checking" />
				Checking
			</label>
			<label>
				<input type="radio" name="accountCategory" value="savings" />
				Savings
			</label>
			<p>Account type</p>
			<label>
				<input type="radio" name="accountType" value="business" />
				Business
			</label>
			<label>
				<input type="radio" checked name="accountType" value="personal" />
				Personal
			</label>
			<br /><br />
			<input required name="routingNumber" placeholder="Routing number" />
			<br /><br />
			<input required name="accountNumber" placeholder="Account number" />
			<br /><br />
			<input required name="accountName" placeholder="Account name" />
			<br /><br />
			<button>Add Method</button>
		</form>
	{/if}

	{#if payoutMethod == 'cryptocurrency'}
		<form style="margin: 1rem 0;" method="post">
			<input name="method" value={payoutMethod} hidden />
			<label>
				Coin:
				<select name="coin" required>
					{#each availableCryptoOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</label>
			<br /><br />
			<input required name="address" placeholder="Address" />
			<br /><br />
			<button>Add Method</button>
		</form>
	{/if}
</div>
