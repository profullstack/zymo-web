import error from 'primate/handler/error';
import Status from '@rcompat/http/Status';
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

					const provider = query.get('provider');
					console.log('before:', data);

					if (provider === 'mlb') {
						// Preserve the original base path for relative URLs
						const basePath = url.substring(0, url.lastIndexOf('/') + 1);

						// Rewrite relative paths and URLs within the m3u8 response
						data = data.replace(/(URI=")([^"]+)("|,)/g, (match, p1, p2, p3) => {
							const newUrl = p2.startsWith('http')
								? `/proxy?provider=mlb&url=${p2}`
								: `/proxy?provider=mlb&url=${basePath}${p2}`;
							return `${p1}${newUrl}${p3}`;
						});

						data = data.replace(/^([^\s#].*)$/gm, (match) => {
							const newUrl = match.startsWith('http')
								? `/proxy?provider=mlb&url=${match}`
								: `/proxy?provider=mlb&url=${basePath}${match}`;
							return newUrl;
						});
					} else {
						baseURL = baseURL.origin;
						data = data.replace(/^(\/.*)$/gm, `/proxy?url=${baseURL}$1`);
					}

					console.log('after:', data);
					return data;
				}
			}

			console.log('return fetch:', url, headers);
			return fetch(url, { headers, redirect: 'follow' }).catch(console.error);
		} catch (err) {
			console.log(err);
			return error('Error fetching URL', { status: Status.INTERNAL_SERVER_ERROR, ...err });
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
			return error('Error fetching URL', { status: Status.INTERNAL_SERVER_ERROR, ...err });
		}
	}
};
