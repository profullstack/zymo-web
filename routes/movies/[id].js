import { view } from 'primate';

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			files: { File }
		} = store;
		const id = path.get('id');
		const result = await File.getById(id);
		console.log('id:', result);

		return view('Movie.svelte', { movie: result });
	}
};
