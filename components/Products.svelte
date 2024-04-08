<script>
    export let products = [];
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
                            <label for="subscription_type">$ {product.price} / </label>
                            <select id="{product.stripeProductId}_subscription_select">
                                {#each product.subscriptionPriceIds as subscriptionPriceId}
                                    <option value="{subscriptionPriceId.id}">{subscriptionPriceId.type}</option>
                                {/each}
                            </select> 
                        </div>
                        
                        <button onclick="createCheckoutSession('{product.stripeProductId}')">Subscribe</button>
                    {:else}
                        <div> $ {product.price}</div>
                        <button onclick="createCheckoutSession('{product.stripeProductId}', '{product.stripePriceId}')">Pay</button>
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
            async function createCheckoutSession(stripeProductId, priceId = null){

                if(!priceId) priceId = document.getElementById(stripeProductId + "_subscription_select").value

                const response = await fetch('/payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ stripeProductId, priceId })
                });

                const body = await response.json()
                window.open(body.url, '_blank').focus()
            }
        </script>
    
    {:else}
        <h1 style="color: gray;">No products yet</h1>
    {/if}

</div>