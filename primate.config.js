import svelte from '@primate/svelte';
import handlebars from '@primate/handlebars';
import store from '@primate/store';
import surrealdb from '@primate/surrealdb';
import session from '@primate/session';
import native from '@primate/native';
import { config } from 'dotenv-flow';

config();

const {
	PORT: port,
	DB_USER: username,
	DB_PASS: password,
	DB_HOST: host,
	DB_NS: namespace,
	DB_DB: database,
	DB_PORT: db_port,
	APP_DOMAIN,
	GOOGLE_ANALYTICS_ID,
	GOOGLE_ADS_ID,
	APP_NAME,
	APP_SHORT_NAME,
	APP_DESCRIPTION,
	PHONE,
	EMAIL,
	HCAPTCHA_SITE_KEY,
	AFFILIATE_COMMISSION_PERCENT
} = process.env;

const useSpa = true;
console.log(host, port, db_port);

export default {
	http: {
		port
		// csp: {
		// 	'default-src': '*',
		// 	'script-src': "'unsafe-inline' 'self' 'unsafe-eval' *",
		// 	'style-src': "'unsafe-inline' 'self' *",
		// 	'img-src': "'unsafe-inline' 'self' data: *"
		// }
	},
	build: {
		includes: ['modules'],
		define: {
			REPLACE_APP_DOMAIN: `'${APP_DOMAIN}'`,
			REPLACE_GOOGLE_ANALYTICS_ID: `'${GOOGLE_ANALYTICS_ID}'`,
			REPLACE_GOOGLE_ADS_ID: `'${GOOGLE_ADS_ID}'`,
			REPLACE_APP_NAME: `'${APP_NAME}'`,
			REPLACE_APP_SHORT_NAME: `${APP_SHORT_NAME}`,
			REPLACE_APP_DESCRIPTION: `'${APP_DESCRIPTION}'`,
			REPLACE_PHONE: `'${PHONE}'`,
			REPLACE_EMAIL: `'${EMAIL}'`,
			REPLACE_HCAPTCHA_SITE_KEY: `"${HCAPTCHA_SITE_KEY}"`,
			REPLACE_AFFILIATE_COMMISSION_PERCENT: `'${AFFILIATE_COMMISSION_PERCENT}'`
		},
		minify: false,
		includes: ['modules'],
		excludes: [
			'woff',
			'ttf',
			'png',
			'jpg',
			'jpeg',
			'mp4',
			'mkv',
			'mov',
			'webm',
			'mp3',
			'ogg',
			'wav',
			'svg'
		].map((ext) => `*.${ext}`)
	},
	modules: [
		handlebars(),
		svelte({ spa: true }),
		native({ debug: true }),
		store({
			strict: true,
			driver: surrealdb({
				host,
				port: db_port,
				namespace,
				database,
				username,
				password
			})
		}),
		session(),
		{
			name: 'stripe-webhook-intercept',
			handle(request, next) {
				if (request.url.pathname == '/payment/stripe/webhook') {
					//set content-type to plain so the request body is unadulterated
					request.original.headers.set('content-type', 'text/plain');
				}
				return next({
					...request
				});
			}
		}
	]
};
