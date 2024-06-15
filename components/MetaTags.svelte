<script>
	import { page } from '$app/stores';

	let defaultMetaData = {
		title: 'APP_NAME',
		description:
			'APP_DESCRIPTION',
		path: ``,
		imagePath: `/images/meta-banner.png`
	};
	let currentMetaData = defaultMetaData;

	page.subscribe((value) => {
		currentMetaData = {
			title: value.data?.meta?.title || defaultMetaData.title,
			description: value.data?.meta?.description || defaultMetaData.description,
			path: value.data?.meta?.path || defaultMetaData.path,
			imagePath: value.data?.meta?.imagePath || defaultMetaData.imagePath
		};
	});
</script>

<meta name="description" content={currentMetaData.description} />

<!-- Open Graph Meta Tags -->
<meta property="og:title" content={currentMetaData.title} />
<meta property="og:description" content={currentMetaData.description} />
<meta property="og:type" content="website" />
<meta
	property="og:url"
	content={`https://${import.meta.env.VITE_META_DOMAIN}${currentMetaData.path}`}
/>
<meta
	property="og:image"
	content={`https://${import.meta.env.VITE_META_DOMAIN}${currentMetaData.imagePath}`}
/>

<!-- Twitter Card Meta Tags -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content={currentMetaData.title} />
<meta property="twitter:url" content={`https://${import.meta.env.VITE_META_DOMAIN}`} />
<meta property="twitter:domain" content={import.meta.env.VITE_META_DOMAIN} />
<meta property="twitter:description" content={currentMetaData.description} />
<meta
	property="twitter:image"
	content={`https://${import.meta.env.VITE_META_DOMAIN}${currentMetaData.imagePath}`}
/>
