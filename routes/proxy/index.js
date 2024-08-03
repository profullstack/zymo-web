import { Status, error } from 'primate';

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
		const res = await fetch(url, { method: 'HEAD', headers });
		const clonedResponse = res.clone();
		const clonedHeaders = new Headers(clonedResponse.headers);
		console.log('cloned headers:', clonedHeaders);
		// headers.set('content-type', clonedHeaders['content-type']);

		const response = await fetch(url, { headers, redirect: 'follow' });
		const clonedResponse2 = response.clone();
		// Create a new response with the modified headers
		const modifiedResponse = new Response(clonedResponse2.body, {
			status: clonedResponse2.status,
			statusText: clonedResponse2.statusText,
			headers: clonedHeaders
		});

		return await modifiedResponse;
		// try {
		// 	return (await fetch(url, { headers, redirect: 'follow' })).body;
		// } catch (err) {
		// 	console.log(err);
		// 	return error('Error fetching URL', { status: Status.INTERNAL_SERVER_ERROR, ...err });
		// }
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
			const res = await fetch(url, { method: 'HEAD', headers });
			const clonedResponse = res.clone();
			const clonedHeaders = new Headers(clonedResponse.headers);
			console.log('cloned headers:', clonedHeaders);
			// headers.set('content-type', clonedHeaders['content-type']);

			const response = await fetch(url, { method: 'HEAD', headers, redirect: 'follow' });
			const clonedResponse2 = response.clone();
			// Create a new response with the modified headers
			const modifiedResponse = new Response(clonedResponse2.body, {
				status: clonedResponse2.status,
				statusText: clonedResponse2.statusText,
				headers: clonedHeaders
			});

			return await modifiedResponse;
		} catch (err) {
			console.log(err);
			return error('Error fetching URL', { status: Status.INTERNAL_SERVER_ERROR, ...err });
		}
	}
};
