import view from 'primate/handler/view';

export default {
	async post(request) {
		const { store, body } = request;
		const { User } = store;
        const { ids } = body;

		await User.deleteAll(ids);

		return { message: 'Users have been deleted' };
	}
};
