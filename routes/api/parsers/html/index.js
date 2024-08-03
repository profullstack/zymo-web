export default {
	async get(request) {
		const { store, query } = request;
		const {
			parsers: { HTML }
		} = store;

		const url = query.get('url');
		const user = query.get('user');
		const pass = query.get('pass');
		const id = query.get('id');
		const save = Boolean(parseInt(query.get('save')));

		return await HTML.parseIndexPage(id, url, user, pass, save);
	}
};
