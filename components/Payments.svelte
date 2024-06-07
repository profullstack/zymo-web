<script>
	export let payments = [];
	async function cancelSubscription(subscriptionId) {
		const response = await fetch('/payment/cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ subscriptionId })
		});
		const responseBody = await response.json();

		if (responseBody.error) {
			alert(responseBody.error);
		} else if (responseBody.success) {
			window.location = window.location.href;
		}
	}
</script>

<div>
	{#if payments.length}
		<h2>Payments & Subscriptions</h2>

		<div class="payments_container">
			{#each payments as payment}
				{#if payment.product}
					<div class="payment">
						<div class="title">{payment.product.name}</div>
						{#if payment.product.mode == 'subscription'}
							<div>
								<label for="subscription_type"
									>$ {payment.product.price} / {payment.subscriptionInterval}
								</label>
							</div>
							{#if payment.cancelAtPeriodEnd}
								<p style="color:gray;">Cancelled</p>
							{:else}
								<p style="font-size: small;">
									<b> RENEWAL DATE </b>: {payment.renewalDate}
								</p>
								<button
                                    on:click={() => cancelSubscription(payment.stripeSubscriptionId)}
									>Cancel Subscription</button
								>
							{/if}
						{:else}
							<div>$ {payment.product.price}</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
		<style>
			.payments_container {
				display: inline-grid;
				justify-content: center;
				gap: 30px;
				grid-template-columns: auto auto auto auto;
				width: 100%;
			}

			.payment {
				display: flex;
				justify-content: center;
				gap: 20px;
				padding: 15px;
				flex-direction: column;
				width: 20rem;
				border: 1px solid gray;
				border-radius: 10px;
				word-wrap: break-word;
			}

			.payment .title {
				font-weight: bold;
				word-wrap: break-word;
			}
		</style>
	{:else}
		<h1 style="color: gray;">No payments yet</h1>
	{/if}
</div>
