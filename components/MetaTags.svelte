<script>
	let defaultMetaData = {
		title: 'APP_NAME',
		description: 'APP_DESCRIPTION',
		path: ``,
		imagePath: `/images/meta-banner.png`
	};
	let currentMetaData = defaultMetaData;
	export let title;
	export let description;
	export let path;
	export let imagePath;

	currentMetaData = {
		title: title || defaultMetaData.title,
		description: description || defaultMetaData.description,
		path: path || defaultMetaData.path,
		imagePath: imagePath || defaultMetaData.imagePath
	};
</script>

<svelte:head>
	<!-- standard tags -->
	<title>{currentMetaData.title || 'Home'}</title>
	<meta name="description" content={currentMetaData.description} />

	<!-- Open Graph Meta Tags -->
	<meta property="og:title" content={currentMetaData.title} />
	<meta property="og:description" content={currentMetaData.description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`https://APP_DOMAIN${currentMetaData.path}`} />
	<meta property="og:image" content={`https://APP_DOMAIN${currentMetaData.imagePath}`} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:site_name" content={title} />

	<!-- Twitter Card Meta Tags -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={currentMetaData.title} />
	<meta property="twitter:url" content={`https://APP_DOMAIN`} />
	<meta property="twitter:domain" content="APP_DOMAIN" />
	<meta property="twitter:description" content={currentMetaData.description} />
	<meta property="twitter:image" content={`https://APP_DOMAIN${currentMetaData.imagePath}`} />
</svelte:head>
