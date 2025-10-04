export default {
	async get(request) {
		const { path, store } = request;
		const {
			xtream: { Xtream }
		} = store;
		const id = path.get('id');
		
		// Fetch and cache the playlist data
		const xtream = await Xtream.fetchById(id);
		
		// Log the result
		if (xtream && Array.isArray(xtream)) {
			console.log(`Playlist cached: ${xtream.length} channels for provider ${id}`);
			
			// Return success message instead of full data
			// Client uses typeahead search endpoint for filtering
			return {
				success: true,
				message: 'Playlist cached successfully',
				channelCount: xtream.length,
				providerId: id
			};
		} else {
			console.error('Failed to fetch playlist');
			return {
				success: false,
				message: 'Failed to fetch playlist',
				providerId: id
			};
		}
	}
};
