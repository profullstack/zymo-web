// Autocomplete service for server-side channel filtering
// Replaces the client-side filtering that was causing Fire TV freezing

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

class AutocompleteService {
	constructor() {
		this.searchTimeouts = new Map();
		this.cache = new Map();
	}

	/**
	 * Search M3U channels with debouncing and caching
	 * @param {string} providerId - M3U provider ID
	 * @param {string} query - Search query
	 * @param {number} limit - Maximum results (default: 20)
	 * @returns {Promise<Array>} - Search results
	 */
	async searchM3UChannels(providerId, query, limit = 20) {
		return this._debouncedSearch(
			`m3u-${providerId}`,
			query,
			() => this._fetchM3UResults(providerId, query, limit)
		);
	}

	/**
	 * Search Xtream channels with debouncing and caching
	 * @param {string} providerId - Xtream provider ID
	 * @param {string} query - Search query
	 * @param {number} limit - Maximum results (default: 20)
	 * @returns {Promise<Array>} - Search results
	 */
	async searchXtreamChannels(providerId, query, limit = 20) {
		return this._debouncedSearch(
			`xtream-${providerId}`,
			query,
			() => this._fetchXtreamResults(providerId, query, limit)
		);
	}

	/**
	 * Search Movies with debouncing and caching
	 * @param {string} query - Search query
	 * @param {number} limit - Maximum results (default: 20)
	 * @returns {Promise<Array>} - Search results
	 */
	async searchMovies(query, limit = 20) {
		return this._debouncedSearch(
			'movies',
			query,
			() => this._fetchMoviesResults(query, limit)
		);
	}

	/**
	 * Search TV Shows with debouncing and caching
	 * @param {string} query - Search query
	 * @param {number} limit - Maximum results (default: 20)
	 * @returns {Promise<Array>} - Search results
	 */
	async searchTVShows(query, limit = 20) {
		return this._debouncedSearch(
			'tvshows',
			query,
			() => this._fetchTVShowsResults(query, limit)
		);
	}

	/**
	 * Private method to handle debounced search with caching
	 */
	async _debouncedSearch(key, query, fetchFn) {
		// Return empty array for short queries
		if (!query || query.length < MIN_QUERY_LENGTH) {
			return [];
		}

		// Check cache first
		const cacheKey = `${key}:${query.toLowerCase()}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		// Clear existing timeout for this search key
		if (this.searchTimeouts.has(key)) {
			clearTimeout(this.searchTimeouts.get(key));
		}

		// Return promise that resolves after debounce delay
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(async () => {
				try {
					const results = await fetchFn();
					
					// Cache the results for 5 minutes
					this.cache.set(cacheKey, results);
					setTimeout(() => {
						this.cache.delete(cacheKey);
					}, 5 * 60 * 1000);

					resolve(results);
				} catch (error) {
					console.error('Autocomplete search error:', error);
					reject(error);
				} finally {
					this.searchTimeouts.delete(key);
				}
			}, SEARCH_DEBOUNCE_MS);

			this.searchTimeouts.set(key, timeoutId);
		});
	}

	/**
	 * Fetch M3U search results from server
	 */
	async _fetchM3UResults(providerId, query, limit) {
		const url = `/api/m3u/${providerId}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`M3U search failed: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.error) {
			throw new Error(data.error);
		}

		return data.results || [];
	}

	/**
	 * Fetch Xtream search results from server
	 */
	async _fetchXtreamResults(providerId, query, limit) {
		const url = `/api/xtream/stream/${providerId}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Xtream search failed: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.error) {
			throw new Error(data.error);
		}

		return data.results || [];
	}

	/**
	 * Fetch Movies search results from server
	 */
	async _fetchMoviesResults(query, limit) {
		const url = `/api/movies/search?q=${encodeURIComponent(query)}&limit=${limit}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Movies search failed: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.error) {
			throw new Error(data.error);
		}

		return data.results || [];
	}

	/**
	 * Fetch TV Shows search results from server
	 */
	async _fetchTVShowsResults(query, limit) {
		const url = `/api/tv/search?q=${encodeURIComponent(query)}&limit=${limit}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`TV Shows search failed: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.error) {
			throw new Error(data.error);
		}

		return data.results || [];
	}

	/**
	 * Clear all caches and timeouts
	 */
	clear() {
		this.searchTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
		this.searchTimeouts.clear();
		this.cache.clear();
	}
}

// Export singleton instance
export const autocompleteService = new AutocompleteService();

// Export helper functions for easier integration
export const searchM3UChannels = (providerId, query, limit) =>
	autocompleteService.searchM3UChannels(providerId, query, limit);

export const searchXtreamChannels = (providerId, query, limit) =>
	autocompleteService.searchXtreamChannels(providerId, query, limit);

export const searchMovies = (query, limit) =>
	autocompleteService.searchMovies(query, limit);

export const searchTVShows = (query, limit) =>
	autocompleteService.searchTVShows(query, limit);