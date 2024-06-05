<script>
	export let affiliate,
		referrals = [];
	export let APP_DOMAIN;
</script>

<div>
	<h3>Affiliate Dashboard</h3>
	{#if affiliate}
		<div style="padding: 10px;border: 1px solid;border-radius: 10px;">
			<h4>Referrals: {referrals.length}</h4>
			<h4>Commissions Earned: $ {affiliate.commissions}</h4>
			<h4>Referral Code: {affiliate.referralCode}</h4>
			<h4>Referral Link: http://{APP_DOMAIN}/referral/{affiliate.referralCode}</h4>
		</div>
	{:else}
		<form method="post">
			<button>Become an Affiliate</button>
		</form>
	{/if}
</div>
