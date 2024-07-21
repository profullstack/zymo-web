<script>
	export let products = [];

	let stripePriceId;

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	async function createCheckoutSession(stripeProductId, priceId) {
        const response = await fetch('/payment/stripe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stripeProductId, priceId })
        });

		const body = await response.json();
		window.location.href = body.url;
	}

	function getSubscriptionPrice(product) {
		const subscriptionOptions = product.subscriptionOptions;
		const stripePriceId = product.stripePriceId;

		let subscriptionPrice = subscriptionOptions.find((o) => o.id == stripePriceId).price;
		if (!subscriptionPrice) subscriptionPrice = subscriptionOptions[0].price;

		return subscriptionPrice;
	}
</script>

<div class="grid-container">
	<div class="grid-container__item">
		{#if products.length}
			<h2>Products</h2>
			<div class="product_container">
				{#each products as product}
					<div class="product">
						<div class="title">{product.name}</div>
						{#if product.mode == 'subscription'}
							<div class="pricing">
								<label>{currencyFormatter.format(product.price)} / </label>
								<select
									bind:value={product.stripePriceId}
									on:change={() =>
										(product.price = getSubscriptionPrice(product))}
								>
									{#each product.subscriptionOptions as subscriptionOption}
										<option value={subscriptionOption.id}
											>{subscriptionOption.type}</option
										>
									{/each}
								</select>
							</div>

							<button
								class="button button--primary"
								on:click={() =>
									createCheckoutSession(
										product.stripeProductId,
										product.stripePriceId
									)}>Subscribe</button
							>
						{:else}
							<div>$ {product.price}</div>
							<button
								class="button button--primary"
								on:click={() =>
									createCheckoutSession(
										product.stripeProductId,
										product.stripePriceId
									)}>Pay</button
							>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<h1 style="color: gray;">No products yet</h1>
		{/if}
	</div>
</div>

<style>
	h1,
	h2,
	h3 {
		margin-block-start: 0.83em;
		margin-block-end: 0.83em;
	}
	select {
		background-color: transparent;
		color: white;
		padding: 0.5rem;
		border: none;
		outline: none;
	}
	select option {
		background-color: var(--background-color);
	}

	.product_container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
	}

	.product {
		display: flex;
		justify-content: center;
		gap: 2rem;
		padding: 1.5rem;
		flex-direction: column;
		width: 100%;
		flex-wrap: nowrap;
		border: 0.1rem solid gray;
		border-radius: 1rem;
	}

	.product .title {
		font-weight: bold;
		word-wrap: break-word;
	}

	.product .pricing {
		margin-top: auto;
	}

	.product button {
		margin-top: auto;
	}

	@media (min-width: 640px) {
		.product {
			width: 20rem;
		}
	}
</style>
