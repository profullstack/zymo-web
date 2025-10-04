import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

const form = (params = {}) => view('apikeys/Form.svelte', { ...params });

export default {
	async get(request) {
		const { session, store, path } = request;
		const {
			m3u: { M3U }
		} = store;

		const id = path.get('id');
		
		// Fetch and cache the M3U playlist data
		const m3uData = await M3U.fetchById(id);
		
		// Return success message instead of full M3U text
		// Client uses typeahead search endpoint for filtering
		if (m3uData) {
			// Count channels in M3U text
			const channelCount = (m3uData.match(/#EXTINF/g) || []).length;
			console.log(`M3U playlist cached: ${channelCount} channels for provider ${id}`);
			
			return {
				success: true,
				message: 'M3U playlist cached successfully',
				channelCount,
				providerId: id
			};
		} else {
			console.error('Failed to fetch M3U playlist');
			return {
				success: false,
				message: 'Failed to fetch M3U playlist',
				providerId: id
			};
		}
	},
	async post(request) {
		const { session, store } = request;
		const {
			m3u: { Form, M3U }
		} = store;

		try {
			const data = request.body;

			await Form.validate(data);

			try {
				const m3u = await M3U.create(data);
				console.log('m3u:', m3u);
				return redirect('/dashboard');
			} catch (err) {
				return form({ status: err.message });
			}
		} catch ({ errors }) {
			return form({ errors });
		}
	}
};
