<script>
	import MetaTags from './MetaTags.svelte';

	export let APP_NAME, APP_DESCRIPTION;

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

	const meta = {
		title: { APP_NAME } - { APP_DESCRIPTION },
		description: { APP_DESCRIPTION }
	};
</script>

<svelte:head>
	<MetaTags {...meta} />
</svelte:head>

<h1>Welcome to {APP_NAME}!</h1>

<p>{APP_DESCRIPTION}</p>

<h3>Join our waitlist</h3>

<form>
	<input bind:value={waitlistEmail} placeholder="Email address" />
	<br /><br />
	<button on:click={joinWaitlist}> Join now </button>
</form>
