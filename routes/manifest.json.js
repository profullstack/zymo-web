import env from '@rcompat/env';

const { APP_NAME, APP_DESCRIPTION, APP_SHORT_NAME, APP_DOMAIN } = env;

export default {
	get() {
		return {
			name: `${APP_NAME}`,
			version: '1.0',
			description: `${APP_DESCRIPTION}`,
			short_name: `${APP_SHORT_NAME}`,
			icons: [
				{
					src: '/static/icons/android-chrome-36x36.png',
					sizes: '36x36',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-48x48.png',
					sizes: '48x48',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-72x72.png',
					sizes: '72x72',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-96x96.png',
					sizes: '96x96',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-144x144.png',
					sizes: '144x144',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-192x192.png',
					sizes: '192x192',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-256x256.png',
					sizes: '256x256',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-384x384.png',
					sizes: '384x384',
					type: 'image/png'
				},
				{
					src: '/static/icons/android-chrome-512x512.png',
					sizes: '512x512',
					type: 'image/png'
				}
			],
			start_url: `https://${APP_DOMAIN}/`,
			background_color: '#f7f7f7',
			theme_color: '#333'
		};
	}
};
