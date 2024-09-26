<script>
	import MetaTags from './MetaTags.svelte';
	import AffliateLinks from './AffliateLinks.svelte';

	let waitlistEmail = '';

	function isEmail(email) {
		var emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		if (email !== '' && email.match(emailFormat)) {
			return true;
		}

		return false;
	}
	async function joinWaitlist(e) {
		e.preventDefault();
		try {
			if (!waitlistEmail || !isEmail(waitlistEmail)) {
				alert('Please provide a valid email address');
				return;
			}

			const response = await fetch('/waitlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: waitlistEmail })
			});

			if (response.ok) {
				alert('Successfully subscribed to waitlist');
			} else {
				alert('Email already exists');
			}
		} catch (e) {}
	}

	const appName = REPLACE_APP_NAME;
	const appDescription = REPLACE_APP_DESCRIPTION;
	const meta = {
		title: `${appName} - ${appDescription}`,
		description: appDescription
	};
</script>

<MetaTags {...meta} />

<h3>Join our waitlist</h3>

<form>
	<input bind:value={waitlistEmail} placeholder="Email address" />
	<br /><br />
	<button on:click={joinWaitlist}> Join now </button>

	<video controls playsinline>
		<source src="/videos/30sec-video1.mp4" type="video/mp4" />
		Your browser does not support the video tag.
	</video>

	<p>
		Checkout our <a href="/pricing">pricing page</a> and <a href="/register">register</a> now!
	</p>
	<AffliateLinks />
</form>

<style>
	video {
		margin: 2rem;
		max-width: 80vw;
		width: auto;
	}
</style>
