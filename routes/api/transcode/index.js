export default {
	async get(request) {
		const { store, query } = request;
		const {
			transcode: { Transcode }
		} = store;

		const url = query.get('url');
		const user = query.get('user');
		const pass = query.get('pass');

		return Transcode.start(url, user, pass);
	},
	async head(request) {
		const { query } = request;

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
