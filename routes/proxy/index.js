import error from 'primate/handler/error';
import { OK, INTERNAL_SERVER_ERROR } from '@rcompat/http/status';

export default {
	async get(request) {
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

			return fetch(url, { headers, redirect: 'follow' });
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
