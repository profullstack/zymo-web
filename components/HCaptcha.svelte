<!-- HCaptcha.svelte -->
<script>
	import { onMount } from 'svelte';

	// You can pass your sitekey as a prop:
	export let sitekey;

	let widgetId; // hCaptcha widget ID once rendered

	/**
	 * Returns the current hCaptcha token.
	 */
	export function getCaptchaToken() {
		if (window.hcaptcha && widgetId !== undefined) {
			return window.hcaptcha.getResponse(widgetId);
		}
		return '';
	}

	onMount(() => {
		// Because the script is loaded async/defer, we may need to poll for readiness:
		if (!window.hcaptcha) {
			const checkScript = setInterval(() => {
				if (window.hcaptcha) {
					clearInterval(checkScript);
				}
			}, 300);
		}
	});
</script>

<svelte:head>
	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
</svelte:head>

<div class="h-captcha" data-sitekey={sitekey}></div>
