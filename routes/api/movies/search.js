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
			// Fetch all movies for the user
			const allMovies = await File.getAllByUserId(userId, 'video', 'movie');

			if (!allMovies || !Array.isArray(allMovies)) {
				return { 
					query, 
					results: [], 
					total: 0, 
					returned: 0 
				};
			}

			// Filter movies by name (case insensitive) - search in mediaInfo.name
			const filteredMovies = allMovies.filter(movie => {
				const movieName = movie.mediaInfo?.name || movie.title || '';
				return movieName.toLowerCase().includes(query.toLowerCase());
			});

			// Sort alphabetically by name and limit results
			const results = filteredMovies
				.sort((a, b) => {
					const nameA = a.mediaInfo?.name || a.title || '';
					const nameB = b.mediaInfo?.name || b.title || '';
					return nameA.localeCompare(nameB);
				})
				.slice(0, limit)
				.map(movie => ({
					id: movie.id,
					name: movie.mediaInfo?.name || movie.title || 'Unknown Name',
					url: movie.url,
					fileExt: movie.fileExt,
					mediaInfo: {
						name: movie.mediaInfo?.name,
						videoType: movie.mediaInfo?.videoType,
						season: movie.mediaInfo?.season
					},
					omdb: movie.omdb ? {
						Poster: movie.omdb.Poster
					} : null
				}));

			return {
				query,
				results,
				total: filteredMovies.length,
				returned: results.length
			};

		} catch (error) {
			console.error('Error filtering movies:', error);
			return { 
				error: 'Failed to search movies', 
				status: 500 
			};
		}
	}
};