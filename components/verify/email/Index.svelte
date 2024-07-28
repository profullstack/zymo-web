<script>
	export let email;

	async function resendVerificationLink() {
		try {
			const res = await fetch('/verify/email/resend', {
				method: 'POST'
			});
			if (res.ok) {
				alert('Verification link resent succesfully');
			} else {
				alert('An error occured');
			}
		} catch (e) {}
	}
</script>

<div>
	<h1>Verify your email address</h1>
	<h4>Click the link sent to "{email}" to verify.</h4>
	<button on:click={resendVerificationLink}>Resend Verification Link</button>
</div>
