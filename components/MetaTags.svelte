<script>
	let defaultMetaData = {
		title: REPLACE_APP_NAME,
		description: REPLACE_APP_DESCRIPTION,
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

	const appName = REPLACE_APP_NAME;
	const appDomain = REPLACE_APP_DOMAIN;
</script>

<svelte:head>
	<!-- standard tags -->
	<title>{currentMetaData.title || 'Home'}</title>
	<meta name="description" content={currentMetaData.description} />

	<!-- Open Graph Meta Tags -->
	<meta property="og:title" content={currentMetaData.title} />
	<meta property="og:description" content={currentMetaData.description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`https://{appDomain}{currentMetaData.path}`} />
	<meta property="og:image" content={`https://{appDomain}{currentMetaData.imagePath}`} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:site_name" content={title} />

	<!-- Twitter Card Meta Tags -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={currentMetaData.title} />
	<meta property="twitter:url" content="https://{appDomain}" />
	<meta property="twitter:domain" content="{appDomain}" />
	<meta property="twitter:description" content={currentMetaData.description} />
	<meta property="twitter:image"
	content="https://{appDomain}{currentMetaData.imagePath}" />
</svelte:head>
