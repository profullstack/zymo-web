<script>
	import NavBar from './NavBar.svelte';
	import { onMount } from 'svelte';

	export let ref;
	export let PHONE;
	export let status;

	let captchaToken = '';
	let form;

	const hcaptchaSiteKey = REPLACE_HCAPTCHA_SITE_KEY;

	onMount(() => {
		window.hcaptchaCallback = (token) => {
			captchaToken = token;
		};
	});

	async function handleSubmit(event) {
		event.preventDefault();
		
		if (!captchaToken) {
			status = 'captcha_failed';
			return;
		}

		const formData = new FormData(form);
		formData.append('h-captcha-response', captchaToken);
		
		try {
			const response = await fetch('/contact', {
				method: 'POST',
				body: formData
			});
			
			if (response.ok) {
				status = 'ok';
				form.reset();
				hcaptcha.reset();
			} else {
				alert('Failed to send message. Please try again.');
			}
		} catch (error) {
			alert('An error occurred. Please try again.');
		}
	}
</script>

<svelte:head>
	<title>Contact Us | Trajectory</title>
	<!-- <meta name="description" content="This is where the description goes for SEO" /> -->
	<link rel="canonical" href="https://trajectory.us.com/contact" />
	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
</svelte:head>

<NavBar />
<section class="contact_container">
	<!-- Backgrounds  -->
	<div class="overlay" />
	<div class="background" />

	<div class="contact_content">
		<!-- intro  -->
		<div class="intro">
			<h1 class="gradient">Contact us</h1>
			<p>
				Let's embark on a journey together. Share your ideas, and we'll help shape them into
				reality. Get in touch now:
			</p>
			<h4>
				Call us directly: <a href="tel:{PHONE}">{PHONE}</a>
			</h4>
			<!-- <p>Download our <a href="https://vcard.link/card/DGv5">vCard</a></p> -->
		</div>
		<!-- form  -->
		<form
			bind:this={form}
			on:submit={handleSubmit}
			class="contact_form"
		>
			{#if status === 'ok'}
				<p class="ok">Your information has been sent to us!</p>
			{:else if status === 'captcha_failed'}
				<p class="error">Please complete the CAPTCHA verification.</p>
			{/if}
			<!-- personal details  -->
			<div class="personal_detail">
				<h3>Personal Details</h3>
				<!-- inputs -->
				<div class="inputs">
					<div class="input_group">
						<input type="text" name="firstName" placeholder="First name" />
						<input type="text" name="lastName" placeholder="Last name" />
					</div>
					<input type="email" name="email" placeholder="Email address" />
					<input type="text" name="phone" placeholder="Phone number" />
					{#if ref}
						<input type="hidden" name="service" value={ref} />
					{/if}
				</div>
			</div>
			<!-- project details  -->
			<div class="project_detail">
				<h3>Job Details</h3>
				<!-- inputs -->
				<div class="inputs">
					<input type="text" name="link" placeholder="Link to job description" />
					<p>Job description</p>
					<textarea rows="8" name="details" placeholder="Enter job description" />
					<input type="text" name="budget" placeholder="Estimated budget" />
					<div class="h-captcha" data-sitekey="{hcaptchaSiteKey}" data-callback="hcaptchaCallback"></div>
					<button type="submit" class="button">Send message</button>
				</div>
			</div>
		</form>
	</div>
</section>

<style>
	h1,
	h3,
	h4,
	p {
		margin: 0;
	}
	.ok {
		background-color: #efe;
		color: #090;
		border: 1px solid #090;
		padding: 1.2rem;
		margin: 0 0 1.2rem;
	}
	.error {
		background-color: #fee;
		color: #900;
		border: 1px solid #900;
		padding: 1.2rem;
		margin: 0 0 1.2rem;
	}
	.contact_container {
		background-image: url('../static/bg.png');
		background-color: #267dfe;
		background-size: cover;
		background-position: center;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		font-family: 'Barlow';
	}

	.contact_content {
		width: 100%;
		z-index: 100;
		margin: 0 auto;
		max-width: 600px;
		margin: 120px 16px 20vh;
	}

	.overlay {
		width: 100%;
		height: 100%;
		position: absolute;
		background: linear-gradient(
			180deg,
			rgb(12, 243, 168, 0.75) 0%,
			rgb(38, 125, 254, 0.25) 100%
		);
		filter: blur(100px);
	}

	.background {
		width: 100%;
		height: 100%;
		position: absolute;
		background: linear-gradient(90deg, black 25%, transparent 100%);
	}

	.intro {
		text-align: center;
		width: 80%;
		color: #fff;
		margin: 0 auto;
	}

	.intro h1 {
		margin-bottom: 1.5rem;
	}

	.intro h4 {
		margin: 8px 0;
	}

	.contact_form {
		margin-top: 4rem;
		padding: 3rem;
		background: #fff;
		color: #1b1b1b;
		width: 100%;
	}

	.inputs {
		margin: 1rem 0 2.5rem;
	}

	.button {
		padding-left: 14px;
		padding-right: 14px;
		padding-top: 7px;
		font-family: inherit;
		padding-bottom: 7px;
		background: #267dfe;
		justify-content: center;
		align-items: center;
		/* width: 200px; */
		height: 45px;
		display: inline-flex;
	}

	textarea {
		margin-top: 0.5rem;
	}

	.input_group {
		display: flex;
		gap: 1rem;
	}

	input,
	textarea {
		font-family: inherit;
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		padding: 20px;
		width: 100%;
	}

	input:focus,
	textarea:focus {
		border: 1px solid #ddd;
		border-width: 1px;
		border-image-slice: 1;
		outline: none;
	}

	.intro a,
	.intro a:visited {
		color: #267dfe;
	}

	.h-captcha {
		margin: 1rem 0;
	}

	/* mobile styles  */
	@media screen and (max-width: 480px) {
		.intro {
			text-align: start;
			width: 100%;
		}

		.input_group {
			display: block;
		}

		.contact_form {
			padding: 2rem;
		}
	}
</style>
