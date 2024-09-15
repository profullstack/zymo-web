<section>
	<div class="pricing-box">
		<div class="header">Starter</div>
		<div class="price">$5<span>/mo<br />or $50 annually</span></div>
		<ul class="features">
			<li>1 Account</li>
			<li class="unavailable">Unlimited Groups</li>
			<li class="unavailable">Unlimited Accounts</li>
			<li class="unavailable">Unlimited Custom Integrations</li>
		</ul>
		<a href="/products" class="select-plan">Select Plan</a>
	</div>
	<div class="pricing-box">
		<div class="header">MVP</div>
		<div class="price">$20<span>/mo<br />or $200 annually</span></div>
		<ul class="features">
			<li>1 Group</li>
			<li>5 Accounts</li>
			<li>1 Free IPTV service provided (up to 3 connections)</li>
			<li class="unavailable">Unlimited Groups</li>
			<li class="unavailable">Unlimited Accounts</li>
			<li class="unavailable">Unlimited Custom Integrations</li>
		</ul>
		<a href="/products" class="select-plan">Select Plan</a>
	</div>
	<div class="pricing-box">
		<div class="header">Lifetime</div>
		<div class="price">
			<div class="price">$400<span>&nbsp;once<br /></span></div>
		</div>
		<ul class="features">
			<li>2 Free IPTV service provided (up to 3 connections each)</li>
			<li>Unlimited Groups</li>
			<li>Unlimited Accounts</li>
			<li>Unlimited Custom Integrations</li>
		</ul>
		<a href="/products" class="select-plan">Select Plan</a>
	</div>
</section>

<style>
	section {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		margin: 0 auto;
	}

	.pricing-box {
		width: 300px;
		padding: 0 0 2rem;
		text-align: center;
		position: relative;
		margin: 1.2rem;
		height: 497.5px;
	}
	.pricing-box .header {
		color: white;
		padding: 4rem 0 0;
		font-size: 2.4rem;
		font-weight: bold;
		position: relative;
		margin-bottom: 2rem;
		text-transform: uppercase;
	}

	.pricing-box .price {
		margin: 6rem 0 0;
		font-size: 3.2rem;
		font-weight: bold;
		font-size: 2rem;
	}
	.pricing-box .price span {
		font-size: 1.6rem;
		color: #888;
	}

	.pricing-box .features {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}
	.pricing-box .features li {
		margin: 1rem 0;
		font-size: 1.6rem;
	}

	.pricing-box .features .unavailable {
		color: gray;
		text-decoration: line-through;
	}

	.pricing-box .select-plan {
		display: inline-block;
		background-color: var(--button-background-color);
		color: white;
		padding: 1rem;
		text-transform: uppercase;
		font-size: 1.6rem;
		font-weight: bold;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		text-decoration: none;
		margin: 1.2rem;
	}

	@media (max-width: 700px) {
		section {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
