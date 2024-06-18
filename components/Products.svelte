<script>
    export let products = [];
    
    let stripePriceId;

    const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
        maximumFractionDigits: 0,
	});

    async function createCheckoutSession(stripeProductId, priceId){

        const response = await fetch('/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stripeProductId, priceId })
        });

        if (response.redirected) {
            window.location.href = response.url;
        }

        const body = await response.json()
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

<div>
    {#if products.length}

        <h2>Products</h2>
        <div class="product_container">
            {#each products as product}
                <div class="product">
                    <div class="title">{product.name}</div>
                    {#if product.mode == "subscription"}
                        <div>
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
                        <div> $ {product.price}</div>
                        <button on:click={() => createCheckoutSession(product.stripeProductId, product.stripePriceId)}>Pay</button>
                    {/if}
                </div>
            {/each}
        </div>
        <style>
            .product_container{
                display: inline-grid;
                justify-content: center;
                gap: 30px;
                grid-template-columns: auto auto auto auto;
                width: 100%;
            }

            .product{
                display: flex;
                justify-content: center;
                gap: 20px;
                padding: 15px;
                flex-direction: column;
                width: 20rem;
                border: 1px solid gray;
                border-radius: 10px;
            }

            .product .title{
                font-weight: bold;
                word-wrap: break-word;
            }
        </style>
        <script>
            
        </script>
    
    {:else}
        <h1 style="color: gray;">No products yet</h1>
    {/if}

</div>