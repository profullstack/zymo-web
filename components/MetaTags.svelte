<script>
	import { onMount } from "svelte";

	export let title = REPLACE_APP_NAME;
	export let description = REPLACE_APP_DESCRIPTION;
	export let path = "";
	export let imagePath = "/images/meta-banner.png";

	const analyticsId = REPLACE_GOOGLE_ANALYTICS_ID;
	const domain = REPLACE_APP_DOMAIN;

	onMount(() => {
		window.dataLayer = window.dataLayer || [];
		function gtag() { dataLayer.push(arguments); }
		gtag('js', new Date());

		gtag('config', analyticsId);
	});
</script>
<svelte:head>
	<!-- standard tags -->
	<title>{title || 'Home'}</title>
	<meta name="description" content={description} />

	<!-- Open Graph Meta Tags -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://{domain}{path}" />
	<meta property="og:image" content="https://{domain}{imagePath}" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:site_name" content={title} />

	<!-- Twitter Card Meta Tags -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:url" content="https://{domain}" />
	<meta property="twitter:domain" content="{domain}" />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content="https://{domain}{imagePath}" />
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id={analyticsId}"></script>
</svelte:head>
