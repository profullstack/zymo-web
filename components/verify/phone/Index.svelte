<script>
	export let verified, phonePrefix, phone;
	export let message, error;

	async function resendVerificationCode() {
		try {
			const res = await fetch('/verify/phone/resend', {
				method: 'POST'
			});
			if (res.ok) {
				alert('Verification code resent succesfully');
			} else {
				alert('An error occured');
			}
		} catch (e) {
			alert('An error occured');
		}
	}
</script>

<div>
	{#if !verified}
		<h2>Verify your phone number</h2>
		<h4>Enter the 6 digit code sent to {phonePrefix} {phone}</h4>

		<div style="color:green">{message ?? ''}</div>
		<div style="color:red">{error ?? ''}</div>

		<form method="POST">
			<input required name="code" placeholder="000000" />
			<button>Verify</button>
		</form>
		<button on:click={resendVerificationCode}>Resend Verification Code</button>
	{:else}
		<h4>Your phone number has already been verified</h4>
	{/if}
</div>
