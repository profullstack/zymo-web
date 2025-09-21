export default {
	async get(request) {
		const { session, store, url } = request;
		const {
			files: { File }
		} = store;

		const { id: userId } = session.get('user');
		const query = url.searchParams.get('q') || '';
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

		// Return empty results for queries less than 2 characters
		if (!query || query.length < 2) {
			return { results: [], total: 0, returned: 0 };
		}

		try {
			// Fetch all TV shows for the user
			const allShows = await File.getAllByUserId(userId, 'video', 'tv show');

			if (!allShows || !Array.isArray(allShows)) {
				return { 
					query, 
					results: [], 
					total: 0, 
					returned: 0 
				};
			}

			// Filter TV shows by name (case insensitive) - search in mediaInfo.name
			const filteredShows = allShows.filter(show => {
				const showName = show.mediaInfo?.name || show.title || '';
				return showName.toLowerCase().includes(query.toLowerCase());
			});

			// Sort alphabetically by name and limit results
			const results = filteredShows
				.sort((a, b) => {
					const nameA = a.mediaInfo?.name || a.title || '';
					const nameB = b.mediaInfo?.name || b.title || '';
					return nameA.localeCompare(nameB);
				})
				.slice(0, limit)
				.map(show => ({
					id: show.id,
					name: show.mediaInfo?.name || show.title || 'Unknown Name',
					url: show.url,
					fileExt: show.fileExt,
					mediaInfo: {
						name: show.mediaInfo?.name,
						videoType: show.mediaInfo?.videoType,
						season: show.mediaInfo?.season,
						episode: show.mediaInfo?.episode
					},
					omdb: show.omdb ? {
						Poster: show.omdb.Poster
					} : null
				}));

			return {
				query,
				results,
				total: filteredShows.length,
				returned: results.length
			};

		} catch (error) {
			console.error('Error filtering TV shows:', error);
			return { 
				error: 'Failed to search TV shows', 
				status: 500 
			};
		}
	}
};