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

		try {
			return (await fetch(url, { headers, redirect: 'follow' })).body;
		} catch (err) {
			console.log(err);
			return error('Error fetching URL', { status: Status.INTERNAL_SERVER_ERROR, ...err });
		}
	}
};
