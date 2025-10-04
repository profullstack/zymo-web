import { parseM3U8 } from '../../../../modules/player.js';

export default {
	async get(request) {
		const { store, path, url } = request;
		const {
			m3u: { M3U }
		} = store;

		const id = path.get('id');
		const query = url.searchParams.get('q') || '';
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

		// Return empty results for queries less than 2 characters
		if (!query || query.length < 2) {
			return [];
		}

		try {
			// Fetch cached M3U data
			const m3uData = await M3U.fetchById(id);
			
			if (!m3uData) {
				return { error: 'Provider not found', status: 404 };
			}

			// Parse M3U8 data to get channels
			const allChannels = parseM3U8(m3uData);
	
			// Split query into words for multi-word matching
			const queryWords = query.toLowerCase().trim().split(/\s+/);
	
			// Filter channels by name (case insensitive, all words must match in any order)
			const filteredChannels = allChannels.filter(channel => {
				const channelName = channel.name?.toLowerCase() || '';
				// All query words must be present in the channel name
				return queryWords.every(word => channelName.includes(word));
			});

			// Sort alphabetically by name and limit results
			const results = filteredChannels
				.sort((a, b) => a.name.localeCompare(b.name))
				.slice(0, limit)
				.map(channel => ({
					name: channel.name,
					url: channel.url,
					channelId: channel.channelId
				}));

			return {
				query,
				results,
				total: filteredChannels.length,
				returned: results.length
			};

		} catch (error) {
			console.error('Error filtering M3U channels:', error);
			return { 
				error: 'Failed to search channels', 
				status: 500 
			};
		}
	}
};