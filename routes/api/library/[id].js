import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

const form = (params = {}) => view('library/Form.svelte', { ...params });

export default {
	async get(request) {
		const { store, path } = request;
		const {
			library: { Library }
		} = store;

		const id = path.get('id');
		return await Library.fetchById(id);
	},
	async post(request) {
		const { store } = request;
		const {
			library: { Form, Library }
		} = store;

		try {
			const data = request.body;

			await Form.validate(data);

			try {
				const library = await Library.create(data);
				console.log('library:', library);
				return redirect('/dashboard');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
