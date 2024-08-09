import view from 'primate/handler/view';

export default {
	async get() {
		return view('torrents/Search.svelte');
	}
};
