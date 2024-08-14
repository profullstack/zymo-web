import view from 'primate/handler/view';

export default {
	async delete(request) {
		const { store, path } = request;
		const { User } = store;

		const result = await User.delete(path.get('id'));

		return { result };
	}
};
