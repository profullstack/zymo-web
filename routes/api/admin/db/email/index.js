export default {
	async get(request) {
		const { store } = request;
		const { EmailArchive } = store;

		const emails = await EmailArchive.getAll();
		return emails;
	}
};
