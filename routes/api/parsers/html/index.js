export default {
	async get(request) {
		const { store, query } = request;
		const {
			parsers: { HTML },
			library: { Library }
		} = store;

		const id = query.get('id');
		const save = query.get('save');

		// Get library details
		const library = await Library.getById(id);
		
		if (!library) {
			return { error: 'Library not found', foundFiles: [] };
		}

		// Parse the library URL directly
		const foundFiles = await HTML.parseIndexPage(
			id,
			library.url,
			library.user,
			library.pass,
			save ? 1 : 0
		);

		return { foundFiles, libraryId: id };
	}
};
