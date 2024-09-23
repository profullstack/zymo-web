import view from 'primate/handler/view';

export default {
	async get() {
		return view('Robots.hbs', {}, { partial: true });
	}
};
