<script>
	export let APP_NAME, APP_DESCRIPTION;
</script>

<svelte:head>
	<title>{APP_NAME} - {APP_DESCRIPTION}</title>
</svelte:head>

<h1>Welcome to {APP_NAME}!</h1>

<p>{APP_DESCRIPTION}</p>
