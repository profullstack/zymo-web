export default {
	async get(request) {
		const { store, query } = request;
		const {
			parsers: { HTML }
		} = store;

		const url = query.get('url');
		const user = query.get('user');
		const pass = query.get('pass');

		return await HTML.parseIndexPage(url, user, pass);
	}
};
