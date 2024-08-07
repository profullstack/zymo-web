import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

const form = (params = {}) => view('torrents/Form.svelte', { ...params });

export default {
	get() {
		return form();
	},
	async post(request) {
		const { session, store } = request;
		const {
			torrent: { Form, Torrent }
		} = store;

		console.log('foo2:', session.get('user'), 'token2:', session.get('token'));
		try {
			const data = request.body;

			await Form.validate(data);

			try {
				const res = await Torrent.create(data, session.get('token'));
				console.log('res:', res);
				return redirect('/dashboard');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
