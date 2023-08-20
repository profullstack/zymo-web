import svelte from '@primate/svelte';
import store from '@primate/store';
import { surrealdb } from '@primate/store';
import types from '@primate/types';
import session from '@primate/session';
import ws from '@primate/ws';
import esbuild from '@primate/esbuild';
import liveview from '@primate/liveview';
import { config } from 'dotenv-flow';
import { Logger } from 'primate';

config();

const {
	PORT: port,
	DB_USER: user,
	DB_PASS: pass,
	DB_HOST: host,
	DB_NS: ns,
	DB_PORT: db_port,
	APP_DOMAIN,
	GOOGLE_ANALYTICS_ID,
	APP_NAME,
	APP_SHORT_NAME,
	APP_DESCRIPTION
} = process.env;

console.log(process.env);

export default {
	logger: {
		// show all logs
		level: Logger.Info,
		trace: true
	},
	http: {
		port
	},
	build: {
		transform: {
			files: ['pages/app.html', 'static/manifest.json'],
			mapper: (contents) =>
				contents
					.replaceAll('APP_DOMAIN', APP_DOMAIN)
					.replaceAll('GOOGLE_ANALYTICS_ID', GOOGLE_ANALYTICS_ID)
					.replaceAll('APP_NAME', APP_NAME)
					.replaceAll('APP_SHORT_NAME', APP_SHORT_NAME)
					.replaceAll('APP_DESCRIPTION', APP_DESCRIPTION)
		}
	},
	modules: [
		svelte(),
		liveview(),
		store({
			strict: true,
			driver: surrealdb({
				host,
				port: db_port,
				ns,
				user,
				pass
			})
		}),
		types(),
		session(),
		ws(),
		esbuild()
	]
};
