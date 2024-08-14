import view from 'primate/handler/view';

export default {
	async delete(request) {
		const { store, path } = request;
		const { User } = store;

		await User.delete(path.get('id'));

		return { message: 'User has been deleted' };
	}
};
