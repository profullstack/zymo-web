import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store, session } = request;
		const {
			library: { Form, Library }
		} = store;

		const userId = session.get('user').id;
		const libraries = await Library.getAllByUserId(userId);

		return view('Library.svelte', { libraries });
	}
};
