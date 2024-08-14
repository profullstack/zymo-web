import view from 'primate/handler/view';

export default {
	async get(request) {
		const { store } = request;
		const { User } = store;

		const users = await User.getAll();
		return view('admin/db/Users.svelte', { users });
	},

	async delete(request) {
		const { store, path } = request;
		const { User } = store;

		const result = await User.delete(path.get('id'));
	}
};
