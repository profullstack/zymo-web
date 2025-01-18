<script>
	import { onMount } from 'svelte';
	import Status from '@rcompat/http/Status';

	export let sitekey;
	let verified = false;

	onMount(async () => {
		await import('@hcaptcha/vanilla-hcaptcha');
		document.getElementById('captcha').addEventListener('verified', async ({ token }) => {
			if ((await fetch(`/verify?token=${token}`)).status === Status.OK) {
				verified = true;
			}
		});
	});
</script>

<h-captcha id="captcha" site-key={sitekey} size="normal" theme="dark"></h-captcha>

<div>Verified: {verified ? 'yes' : 'no'}</div>
