<script>
	import CountrySelect from '../CountrySelect.svelte';
	export let status, errors, countries;
	let captchaToken;

	async function onSubmit(event) {
		if (!captchaToken) {
			event.preventDefault();
			status = 'Please complete the captcha';
			return;
		}
		// Add token to form data
		const formData = new FormData(event.target);
		formData.append('captchaToken', captchaToken);
	}

	function onCaptchaVerify(event) {
		captchaToken = event.detail.token;
	}
</script>

<svelte:head>
	<title>Register</title>
	<link rel="stylesheet" href="/flags.css" />
	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
</svelte:head>

<h1>Register</h1>

<form method="post" on:submit={onSubmit}>
	{status ?? ''}
	<div class="field">
		<input name="firstName" type="text" placeholder="Enter first name" required />
	</div>
	<div>{errors?.firstName ?? ''}</div>
	<div class="field">
		<input name="lastName" type="text" placeholder="Enter last name" required />
	</div>
	<div>{errors?.lastName ?? ''}</div>
	<div class="field">
		<input name="email" type="email" placeholder="Enter email address" required />
	</div>
	<div>{errors?.email ?? ''}</div>
	<div class="field">
		<input name="username" placeholder="Enter username" required />
	</div>
	<div>{errors?.username ?? ''}</div>
	<div class="field row">
		<CountrySelect {countries} {status} {errors} />
		<input name="phone" type="tel" placeholder="Enter phone number" required />
	</div>
	<div>{errors?.phone ?? ''}</div>
	<div class="field">
		<input name="password" type="password" placeholder="Enter password" required />
	</div>
	<div>{errors?.password ?? ''}</div>
	<div class="field">
		<input name="password2" type="password" placeholder="Re-enter password" required />
	</div>
	<div>{errors?.password2 ?? ''}</div>
	<div class="field">
		<div class="h-captcha" data-sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY} data-callback="onCaptchaVerify"></div>
	</div>
	<div>{errors?.captcha ?? ''}</div>
	<footer><button type="submit">Register</button></footer>
</form>
