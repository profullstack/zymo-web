<script>
	export let affiliate, payouts, error;
	let payoutMethod = 'bank';
    let availableCryptoOptions = ["BTC", "ETH", "DOGE"]
</script>

<div>
	<h2>Payout</h2>

    <label>
        Payout Method:
        <select bind:value={payoutMethod}>
            <option value="bank">Bank</option>
            <option value="cryptocurrency">Cryptopcurrency</option>
        </select>
    </label>
    
    <h4>Payout Details</h4>
    {#if error}
        <div style="color: red;">{error}</div>
    {/if}
	{#if payoutMethod == 'bank'}
		<form style="margin: 1rem 0;" method="post">
            <input name="method" value="{payoutMethod}" hidden/>
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
            <br/><br/>
			<input required name="routingNumber" placeholder="Routing number" />
            <br/><br/>
			<input required name="accountNumber" placeholder="Account number" />
            <br/><br/>
            <input required name="accountName" placeholder="Account name" />
            <br/><br/>
            <input required name="amount" placeholder="Amount" type="number" max="{affiliate.balance}"/>
            <br/><br/>
            <button>Payout</button>
		</form>
	{/if}

	{#if payoutMethod == 'cryptocurrency'}
        <form style="margin: 1rem 0;" method="post">
            <input name="method" value="{payoutMethod}" hidden/>
            <label>
                Coin:
                <select name="coin" required>
                    {#each availableCryptoOptions as option}
                        <option value="{option}">{option}</option>
                    {/each}
                </select>
            </label>
            <br/><br/>
            <input required name="amount" placeholder="Amount" type="number" max="{affiliate.balance}"/>
            <br/><br/>
            <input required name="address" placeholder="Address"/>
            <br/><br/>
            <button>Payout</button>
        </form>
	{/if}

    <h2>Recent Payouts</h2>
    {#if payouts.length}
        {#each payouts as payout}
            <div style="padding: 1rem; border: 0.1rem solid black; border-radius: 0.5rem;">
                <h3>$ {payout.amount}</h3>
                <p>Status: {payout.status}</p>
                <p>Payout Method: {payout.method}</p>
                <p>Created: {new Date(payout.createdAt).toLocaleString()} UTC</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;" >
                    {#if payout.method == "bank"}
                        <p><b>Account category:</b> {payout.details.accountCategory}</p>
                        <p><b>Account type:</b> {payout.details.accountType}</p>
                        <p><b>Routing number:</b> {payout.details.routingNumber}</p>
                        <p><b>Account number:</b> {payout.details.accountNumber}</p>
                        <p><b>Account name:</b> {payout.details.accountName}</p>
                    {/if}
                    {#if payout.method == "cryptocurrency"}
                        <p><b>Coin</b>: {payout.details.coin}</p>
                        <p><b>Address</b>: {payout.details.address}</p>
                    {/if}
                </div>
            </div>
            <br/><br/>
        {/each}
    {:else}
        <div>No payouts yet</div>
    {/if}
</div>
