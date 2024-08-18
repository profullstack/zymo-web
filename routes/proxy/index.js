import error from 'primate/handler/error';
import { OK, INTERNAL_SERVER_ERROR } from '@rcompat/http/status';
import MLBTV from '../../modules/providers/mlb.js';
const UA_PC =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
export default {
	async get(request) {
		const { store, query } = request;
		const {
			parsers: { HTML }
		} = store;

		const url = query.get('url');
		const user = query.get('user');
		const pass = query.get('pass');
		const provider = query.get('provider');
		const login_token = query.get('login_token');
		let headers = {};

		if (user && pass) {
			const encodedCredentials = Buffer.from(`${user}:${pass}`).toString('base64');
			headers['Authorization'] = `Basic ${encodedCredentials}`;
		}

		try {
			if (url.indexOf('m3u') > -1) {
				if (provider === 'mlb') {
					// const mlbTv = new MLBTV();
					// const login_token = await mlbTv.login();
					// headers['Authorization'] = `Bearer ${login_token}`;
					// delete headers['Cookie'];

					headers = {
						'User-Agent':
							'Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
						Accept: '*/*',
						'Accept-Language': 'en-US,en;q=0.5',
						'Accept-Encoding': 'gzip, deflate, br, zstd',
						Referer: 'http://localhost:3000/',
						Origin: 'http://localhost:3000',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'cross-site',
						Connection: 'keep-alive'
					};
					// headers['User-Agent'] = UA_PC;
				}

				let baseURL = new URL(url);
				const { pathname } = baseURL;
				console.log(url, pathname, headers);

				const res = await fetch(url, { headers, redirect: 'follow' });

				if (!res.ok) {
					console.error(await res.text());
					return;
				}
				let data = await res.text();

				console.log('before:', data);
				baseURL = baseURL.origin;

				if (url.indexOf('m3u') > -1) {
					let baseURL = new URL(url);
					const res = await fetch(url, { headers, redirect: 'follow' });
					let data = await res.text();

					console.log('before:', data);
					baseURL = baseURL.origin;
					data = data.replace(/^(\/.*)$/gm, `/proxy?url=${baseURL}$1`);
					console.log('after:', data);

					return data;
				}

				// data = data.replace(/^(\/?)(.*)$/gm, (match, p1, p2) => {
				// 	// Skip lines that start with #
				// 	if (match.trim().startsWith('#')) {
				// 		return match; // Return the line as is without any modifications
				// 	}

				// 	// Process other lines
				// 	if (provider === 'mlb') {
				// 		const lastSlashIndex = pathname.lastIndexOf('/');
				// 		const newPathname = pathname.slice(0, lastSlashIndex);
				// 		const tokenized = `${newPathname}`;
				// 		return `/proxy?url=${`${baseURL}${tokenized}/${p2}&provider=mlb`}`;
				// 	} else {
				// 		return `/proxy?url=${`${baseURL}/${p2}`}`;
				// 	}
				// });

				console.log('after:', data);

				return data;
			}

			console.log('return fetch:', url, headers);
			return fetch(url, { headers, redirect: 'follow' }).catch(console.error);
		} catch (err) {
			console.log(err);
			return error('Error fetching URL', { status: INTERNAL_SERVER_ERROR, ...err });
		}
	},
	async head(request) {
		const { store, query } = request;
		const {
			parsers: { HTML }
		} = store;

		const url = query.get('url');
		const user = query.get('user');
		const pass = query.get('pass');
		const headers = {};

		if (user && pass) {
			const encodedCredentials = Buffer.from(`${user}:${pass}`).toString('base64');
			headers['Authorization'] = `Basic ${encodedCredentials}`;
		}

		try {
			return fetch(url, { method: 'HEAD', headers, redirect: 'follow' });
		} catch (err) {
			console.log(err);
			return error('Error fetching URL', { status: INTERNAL_SERVER_ERROR, ...err });
		}
	}
};
