<script>
	export let affiliate, referralCodes = [];
	// export let APP_DOMAIN, AFFILIATE_COMMISSION_PERCENT;

	
	let payoutMethods = affiliate?.payoutMethods || [];

	async function deleteReferralCode(code) {
		try {
			await fetch('/affiliate/code/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ code })
			});
			window.location.reload();
		} catch (e) {}
	}

	async function deletePayoutMethod(id) {
		try {
			await fetch('/affiliate/payouts/method/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});
			window.location.reload();
		} catch (e) {}
	}
</script>

<div class="grid-container">
	<div class="grid-container__item">
		<h2>Affiliate Dashboard</h2>
		{#if affiliate}
			<div style="padding: 10px;border: 1px solid;border-radius: 10px;">
				<h3>Balance: $ {affiliate.balance || 0}</h3>
				<h4>
					Total Commissions: $ {referralCodes.reduce(
						(sum, referral) => sum + referral.commissions,
						0
					)}
				</h4>
				<h4>
					Total Clicks: {referralCodes.reduce(
						(sum, referral) => sum + referral.clicks,
						0
					)}
				</h4>
				<h4>
					Total Conversions: {referralCodes.reduce(
						(sum, referral) => sum + referral.conversions,
						0
					)}
				</h4>
				<h4>Commission Percentage: {AFFILIATE_COMMISSION_PERCENT} %</h4>
			</div>
			<div style="padding: 10px;border: 1px solid;border-radius: 10px; margin: 10px 0;">
				<h4>Referral Links</h4>
				<table style="width: 100%; text-align: center;">
					<tr>
						<th>Name</th>
						<th>Code</th>
						<th>Link</th>
						<th>Clicks</th>
						<th>Conversions</th>
						<th>Commissions</th>
						<th></th>
					</tr>
					{#each referralCodes as referralCode}
						<tr>
							<td>{referralCode.name}</td>
							<td>{referralCode.code}</td>
							<td>http://{APP_DOMAIN}/r/{referralCode.code}</td>
							<td>{referralCode.clicks}</td>
							<td>{referralCode.conversions}</td>
							<td>$ {referralCode.commissions}</td>
							<td
								><a href="/affiliate/code/{referralCode.code}">Rename</a>
								<a href="#" on:click={() => deleteReferralCode(referralCode.code)}
									>Delete</a
								></td
							>
						</tr>
					{/each}
				</table>
				<a href="/affiliate/code/add">Add New</a>
			</div>
			<div style="padding: 10px;border: 1px solid;border-radius: 10px; margin: 10px 0;">
				<h4>Payout Methods</h4>
				<table style="width: 100%; text-align: center;">
					<tr>
						<th>Method</th>
						<th>Details</th>
						<th></th>
					</tr>
					{#each payoutMethods as payoutMethod}
						<tr>
							<td>{payoutMethod.method}</td>
							<div>
								{#if payoutMethod.method == 'bank'}
									<p>
										<b>Account category:</b>
										{payoutMethod.details.accountCategory}
									</p>
									<p><b>Account type:</b> {payoutMethod.details.accountType}</p>
									<p>
										<b>Routing number:</b>
										{payoutMethod.details.routingNumber}
									</p>
									<p>
										<b>Account number:</b>
										{payoutMethod.details.accountNumber}
									</p>
									<p><b>Account name:</b> {payoutMethod.details.accountName}</p>
								{/if}
								{#if payoutMethod.method == 'cryptocurrency'}
									<p><b>Coin</b>: {payoutMethod.details.coin}</p>
									<p><b>Address</b>: {payoutMethod.details.address}</p>
								{/if}
							</div>
							<td
								><a href="/affiliate/payouts/method/{payoutMethod.id}">Edit</a>
								<a href="#" on:click={() => deletePayoutMethod(payoutMethod.id)}
									>Delete</a
								></td
							>
						</tr>
					{/each}
				</table>
				<a href="/affiliate/payouts/method/add">Add Payout Method</a>
				<a href="/affiliate/payouts">View Payouts</a>
			</div>
			{#if referralCodes[0]}
				<div class="promos">
					<p>
						For payouts, we recommend using <a
							href="https://wise.com/invite/dic/anthonye828">wise.com</a
						>
						as they support International payments via ACH. You can setup a US-based business
						bank account at
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
					>{`🚀 Maximize Your Earnings with FastestEngineer!
									
					Join the FastestEngineer affiliate
					program and unlock the potential to earn up to $4K/month recurring per sale! Boost
					your monthly income by promoting our comprehensive SaaS tools, and offer your
					subscribers a special 10% discount. It’s an excellent opportunity for sustainable
					and significant earnings. Get started now: http://${APP_DOMAIN}/r/${referralCodes[0].code}`}</textarea
				>
				<p>Here's some text you can use to promote FastestEngineer:</p>
				<textarea class="promo-text"
					>{`Launch Your SaaS Faster with FastestEngineer! 🚀
					
					Ready to transform your SaaS vision into reality? With FastestEngineer's fully featured boilerplate, you can build and launch your app in record time—days, not months! Our pre-built solution saves you weeks of development, allowing you to focus on perfecting the features that truly matter. Accelerate your path to market and stay ahead of the competition.
					
					🌟 Why Choose FastestEngineer?
					
						Speed: Launch your app faster than ever.
						Efficiency: Focus more on product and less on process.
						Scalability: Grow your SaaS with a robust foundation.
					
					Ready to start building? Use this link to get started and take advantage of all that FastestEngineer has to offer: http://${APP_DOMAIN}/r/${referralCodes[0].code}
					
					Build smart, launch fast, grow your SaaS with FastestEngineer!`}</textarea
				>
			{/if}
		{:else}
			<form method="post">
				<button>Become an Affiliate</button>
			</form>
		{/if}
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
		width: 100%;
	}
</style>
