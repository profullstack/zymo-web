<script>
	export let affiliate,
		referrals = [];
	export let APP_DOMAIN, AFFILIATE_COMMISSION_PERCENT;
</script>

<div class="grid-container">
	<div class="grid-container__item">
		<h3>Affiliate Dashboard</h3>
		{#if affiliate}
			<div style="padding: 10px;border: 1px solid;border-radius: 10px;">
				<h4>Referrals: {referrals.length}</h4>
				<h4>Commission Percentage: {AFFILIATE_COMMISSION_PERCENT} %</h4>
				<h4>Commissions Earned: $ {affiliate.commissions}</h4>
				<h4>Referral Code: {affiliate.referralCode}</h4>
				<h4>Referral Link: http://{APP_DOMAIN}/referral/{affiliate.referralCode}</h4>
			</div>
		{:else}
			<form method="post">
				<button>Become an Affiliate</button>
			</form>
		{/if}
		<div class="promos">
			<p>
				For payouts, we recommend using <a href="https://wise.com/invite/dic/anthonye828"
					>wise.com</a
				>
				as they support International payments via ACH. You can setup a US-based business bank
				account at
				<a href="https://mercury.com/r/profullstack">mercury.com</a>.
			</p>
			<p>
				You can apply for a business credit card from <a
					href=" https://americanexpress.com/en-us/referral/bluebusinesscash-credit-card?ref=ANTHOEhFtj&xl=cp15"
					>americanexpress.com</a
				>
				or <a href="https://www.referyourchasecard.com/21q/2X53EJ4KH6">chase.com</a>
			</p>
		</div>

		<p>Here's some promo text you can use to promote our affiliate program:</p>
		<textarea class="promo-text"
			>${`🚀 Maximize Your Earnings with FastestEngineer!
				
Join the FastestEngineer affiliate
program and unlock the potential to earn up to $4K/month recurring per sale! Boost
your monthly income by promoting our comprehensive SaaS tools, and offer your
subscribers a special 10% discount. It’s an excellent opportunity for sustainable
and significant earnings. Get started now: http://${APP_DOMAIN}/referral/${affiliate.referralCode}`}</textarea
		>
		<p>Here's some text you can use to promote FastestEngineer:</p>
		<textarea class="promo-text"
			>${`Launch Your SaaS Faster with FastestEngineer! 🚀

Ready to transform your SaaS vision into reality? With FastestEngineer's fully featured boilerplate, you can build and launch your app in record time—days, not months! Our pre-built solution saves you weeks of development, allowing you to focus on perfecting the features that truly matter. Accelerate your path to market and stay ahead of the competition.

🌟 Why Choose FastestEngineer?

    Speed: Launch your app faster than ever.
    Efficiency: Focus more on product and less on process.
    Scalability: Grow your SaaS with a robust foundation.

Ready to start building? Use this link to get started and take advantage of all that FastestEngineer has to offer: http://${APP_DOMAIN}/referral/${affiliate.referralCode}

Build smart, launch fast, grow your SaaS with FastestEngineer!`}</textarea
		>
	</div>
</div>

<style>
	h1,
	h2,
	h3,
	h4 {
		margin-block-start: 0.83em;
		margin-block-end: 0.83em;
	}

	p {
		margin: 1.2rem 0;
	}

	.promos a,
	.promos a:visited {
		text-decoration: underline;
		font-weight: 700;
	}

	.promo-text {
		height: 10rem;
	}
</style>
