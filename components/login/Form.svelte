<script>
	import NDK, { NDKNip07Signer, NDKEvent } from '@nostr-dev-kit/ndk';

	export let next, status, errors;

	async function loginWithNostr(e) {
		e.preventDefault();

		console.log('nostr login');

		const signer = new NDKNip07Signer();
		const ndk = new NDK({
			signer,
			explicitRelayUrls: [
				'wss://relay.damus.io',
				'wss://relay.nostr.band',
				'wss://relay.primal.net'
			]
		});

		await ndk.connect();

		const user = await signer.user();
		console.log('user:', user);
		const user2 = ndk.getUser({
			npub: user.npub
		});
		console.log('user2:', user2);
		const profile = await user.fetchProfile();
		console.log('profile:', profile);
		const res = await fetch('/api/nostr/signup', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(profile)
		});
		const me = await res.json();

		console.log('me:', me);
		/*
		{
  "name": "GlobalThreat",
  "website": "https://globalthreat.info",
  "displayName": "Global Threat, Inc.",
  "created_at": 1699254208,
  "about": "Realtime global threat assessment driven by AI",
  "lud16": "zap@pay.globalthreat.info",
  "image": "https://m.primal.net/HPLr.png",
  "banner": "https://m.primal.net/HPLs.svg",
  "nip05": "npub19p3l898yf76s73m5pr0ru03a0y8ps6c3se6xcekz8d8v2f676kxs5vwdmw"
}
*/
	}
</script>

<section>
	<h1>Login</h1>

	<form method="post">
		{#if next}
			<input type="hidden" name="next" value={next} />
		{/if}
		{status ?? ''}
		<div class="field"><input name="email" placeholder="Enter email address" /></div>
		<div>{errors?.email ?? ''}</div>
		<p><strong>-- or --</strong></p>
		<div class="field"><input name="phone" type="tel" placeholder="Enter phone number" /></div>
		<div>{errors?.phone ?? ''}</div>
		<div class="field">
			<input name="password" type="password" placeholder="Enter password" required />
		</div>
		<div>{errors?.password ?? ''}</div>
		<footer><button type="submit">Login</button></footer>
		<p><strong>-- or --</strong></p>
		<footer><button type="button" on:click={loginWithNostr}>Login with Nostr</button></footer>
	</form>

	<p><a href="/reset">Forgot password?</a></p>
</section>
