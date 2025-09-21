export default {
	async get(request) {
		const { store, path, url } = request;
		const {
			xtream: { Xtream }
		} = store;

		const id = path.get('id');
		const query = url.searchParams.get('q') || '';
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

		// Return empty results for queries less than 2 characters
		if (!query || query.length < 2) {
			return [];
		}

		try {
			// Fetch cached Xtream data
			const xtreamData = await Xtream.fetchById(id);
			
			if (!xtreamData) {
				return { error: 'Provider not found', status: 404 };
			}

			// Parse JSON data to get channels (already parsed from fetchById)
			const allChannels = Array.isArray(xtreamData) ? xtreamData : [];

			// Filter channels by name (case insensitive)
			const filteredChannels = allChannels.filter(channel =>
				channel.name?.toLowerCase().includes(query.toLowerCase())
			);

			// Sort alphabetically by name and limit results
			const results = filteredChannels
				.sort((a, b) => a.name.localeCompare(b.name))
				.slice(0, limit)
				.map(channel => ({
					name: channel.name,
					url: channel.url,
					stream_id: channel.stream_id
				}));

			return {
				query,
				results,
				total: filteredChannels.length,
				returned: results.length
			};

		} catch (error) {
			console.error('Error filtering Xtream channels:', error);
			return { 
				error: 'Failed to search channels', 
				status: 500 
			};
		}
	}
};