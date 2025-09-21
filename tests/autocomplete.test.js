import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';

// Mock data for testing
const mockChannels = [
	{ name: 'CNN International', url: 'http://example.com/cnn.m3u8', channelId: 'cnn-intl' },
	{ name: 'BBC World News', url: 'http://example.com/bbc.m3u8', channelId: 'bbc-world' },
	{ name: 'Fox News', url: 'http://example.com/fox.m3u8', channelId: 'fox-news' },
	{ name: 'ESPN', url: 'http://example.com/espn.m3u8', channelId: 'espn' },
	{ name: 'Discovery Channel', url: 'http://example.com/discovery.m3u8', channelId: 'discovery' }
];

// Helper function to simulate server-side filtering
function serverSideFilter(channels, query, limit = 20) {
	if (!query || query.length < 2) {
		return [];
	}

	const filtered = channels.filter(channel =>
		channel.name.toLowerCase().includes(query.toLowerCase())
	);

	// Sort alphabetically and limit results
	return filtered
		.sort((a, b) => a.name.localeCompare(b.name))
		.slice(0, limit);
}

describe('Server-side autocomplete functionality', () => {
	describe('Channel search filtering', () => {
		it('should return empty array for queries less than 2 characters', () => {
			const result = serverSideFilter(mockChannels, 'C');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should filter channels by name (case insensitive)', () => {
			const result = serverSideFilter(mockChannels, 'news');
			expect(result).to.have.lengthOf(2);
			expect(result[0].name).to.equal('BBC World News');
			expect(result[1].name).to.equal('Fox News');
		});

		it('should return channels sorted alphabetically', () => {
			const result = serverSideFilter(mockChannels, 'C');
			const names = result.map(channel => channel.name);
			const sortedNames = [...names].sort();
			expect(names).to.deep.equal(sortedNames);
		});

		it('should limit results to specified number', () => {
			const result = serverSideFilter(mockChannels, 'ne', 2);
			expect(result).to.have.lengthOf(2);
		});

		it('should handle exact matches', () => {
			const result = serverSideFilter(mockChannels, 'ESPN');
			expect(result).to.have.lengthOf(1);
			expect(result[0].name).to.equal('ESPN');
		});

		it('should handle partial matches', () => {
			const result = serverSideFilter(mockChannels, 'Disc');
			expect(result).to.have.lengthOf(1);
			expect(result[0].name).to.equal('Discovery Channel');
		});
	});

	describe('API response format', () => {
		it('should return properly formatted response structure', () => {
			const result = serverSideFilter(mockChannels, 'news');
			
			expect(result).to.be.an('array');
			result.forEach(channel => {
				expect(channel).to.have.property('name').that.is.a('string');
				expect(channel).to.have.property('url').that.is.a('string');
				expect(channel).to.have.property('channelId').that.is.a('string');
			});
		});
	});
});

// Mock movies data for testing
const mockMovies = [
	{
		id: 'movie1',
		mediaInfo: { name: 'Avatar' },
		url: 'http://example.com/avatar.mp4',
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/avatar.jpg' }
	},
	{
		id: 'movie2',
		mediaInfo: { name: 'The Matrix' },
		url: 'http://example.com/matrix.mp4',
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/matrix.jpg' }
	},
	{
		id: 'movie3',
		mediaInfo: { name: 'Inception' },
		url: 'http://example.com/inception.mp4',
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/inception.jpg' }
	},
	{
		id: 'movie4',
		mediaInfo: { name: 'The Dark Knight' },
		url: 'http://example.com/batman.mp4',
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/batman.jpg' }
	},
	{
		id: 'movie5',
		mediaInfo: { name: 'Interstellar' },
		url: 'http://example.com/interstellar.mp4',
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/interstellar.jpg' }
	}
];

// Helper function to simulate server-side movies filtering
function serverSideMoviesFilter(movies, query, limit = 20) {
	if (!query || query.length < 2) {
		return [];
	}

	const filtered = movies.filter(movie =>
		movie.mediaInfo.name.toLowerCase().includes(query.toLowerCase())
	);

	// Sort alphabetically and limit results
	return filtered
		.sort((a, b) => a.mediaInfo.name.localeCompare(b.mediaInfo.name))
		.slice(0, limit);
}

describe('Movies search functionality', () => {
	describe('Movies search filtering', () => {
		it('should return empty array for queries less than 2 characters', () => {
			const result = serverSideMoviesFilter(mockMovies, 'A');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should filter movies by name (case insensitive)', () => {
			const result = serverSideMoviesFilter(mockMovies, 'the');
			expect(result).to.have.lengthOf(2);
			expect(result[0].mediaInfo.name).to.equal('The Dark Knight');
			expect(result[1].mediaInfo.name).to.equal('The Matrix');
		});

		it('should return movies sorted alphabetically', () => {
			const result = serverSideMoviesFilter(mockMovies, 'a');
			const names = result.map(movie => movie.mediaInfo.name);
			const sortedNames = [...names].sort();
			expect(names).to.deep.equal(sortedNames);
		});

		it('should limit results to specified number', () => {
			const result = serverSideMoviesFilter(mockMovies, 'in', 1);
			expect(result).to.have.lengthOf(1);
		});

		it('should handle exact matches', () => {
			const result = serverSideMoviesFilter(mockMovies, 'Avatar');
			expect(result).to.have.lengthOf(1);
			expect(result[0].mediaInfo.name).to.equal('Avatar');
		});

		it('should handle partial matches', () => {
			const result = serverSideMoviesFilter(mockMovies, 'Inter');
			expect(result).to.have.lengthOf(1);
			expect(result[0].mediaInfo.name).to.equal('Interstellar');
		});
	});

	describe('Movies API response format', () => {
		it('should return properly formatted movie response structure', () => {
			const result = serverSideMoviesFilter(mockMovies, 'the');
			
			expect(result).to.be.an('array');
			result.forEach(movie => {
				expect(movie).to.have.property('id').that.is.a('string');
				expect(movie).to.have.property('mediaInfo').that.is.an('object');
				expect(movie.mediaInfo).to.have.property('name').that.is.a('string');
				expect(movie).to.have.property('url').that.is.a('string');
				expect(movie).to.have.property('fileExt').that.is.a('string');
			});
		});
	});
});

// Mock TV shows data for testing
const mockTVShows = [
	{ 
		id: 'show1', 
		mediaInfo: { name: 'Breaking Bad', season: 1, episode: 1 }, 
		url: 'http://example.com/breaking-bad-s1e1.mp4', 
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/breaking-bad.jpg' }
	},
	{ 
		id: 'show2', 
		mediaInfo: { name: 'Game of Thrones', season: 1, episode: 1 }, 
		url: 'http://example.com/got-s1e1.mp4', 
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/got.jpg' }
	},
	{ 
		id: 'show3', 
		mediaInfo: { name: 'The Office', season: 1, episode: 1 }, 
		url: 'http://example.com/office-s1e1.mp4', 
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/office.jpg' }
	},
	{ 
		id: 'show4', 
		mediaInfo: { name: 'The Walking Dead', season: 1, episode: 1 }, 
		url: 'http://example.com/walking-dead-s1e1.mp4', 
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/walking-dead.jpg' }
	},
	{ 
		id: 'show5', 
		mediaInfo: { name: 'Stranger Things', season: 1, episode: 1 }, 
		url: 'http://example.com/stranger-things-s1e1.mp4', 
		fileExt: 'mp4',
		omdb: { Poster: 'http://example.com/stranger-things.jpg' }
	}
];

// Helper function to simulate server-side TV shows filtering
function serverSideTVShowsFilter(shows, query, limit = 20) {
	if (!query || query.length < 2) {
		return [];
	}

	const filtered = shows.filter(show =>
		show.mediaInfo.name.toLowerCase().includes(query.toLowerCase())
	);

	// Sort alphabetically and limit results
	return filtered
		.sort((a, b) => a.mediaInfo.name.localeCompare(b.mediaInfo.name))
		.slice(0, limit);
}

describe('TV Shows search functionality', () => {
	describe('TV Shows search filtering', () => {
		it('should return empty array for queries less than 2 characters', () => {
			const result = serverSideTVShowsFilter(mockTVShows, 'T');
			expect(result).to.be.an('array').that.is.empty;
		});

		it('should filter TV shows by name (case insensitive)', () => {
			const result = serverSideTVShowsFilter(mockTVShows, 'the');
			expect(result).to.have.lengthOf(2);
			expect(result[0].mediaInfo.name).to.equal('The Office');
			expect(result[1].mediaInfo.name).to.equal('The Walking Dead');
		});

		it('should return TV shows sorted alphabetically', () => {
			const result = serverSideTVShowsFilter(mockTVShows, 'a');
			const names = result.map(show => show.mediaInfo.name);
			const sortedNames = [...names].sort();
			expect(names).to.deep.equal(sortedNames);
		});

		it('should limit results to specified number', () => {
			const result = serverSideTVShowsFilter(mockTVShows, 'th', 1);
			expect(result).to.have.lengthOf(1);
		});

		it('should handle exact matches', () => {
			const result = serverSideTVShowsFilter(mockTVShows, 'Breaking Bad');
			expect(result).to.have.lengthOf(1);
			expect(result[0].mediaInfo.name).to.equal('Breaking Bad');
		});

		it('should handle partial matches', () => {
			const result = serverSideTVShowsFilter(mockTVShows, 'Strang');
			expect(result).to.have.lengthOf(1);
			expect(result[0].mediaInfo.name).to.equal('Stranger Things');
		});
	});

	describe('TV Shows API response format', () => {
		it('should return properly formatted TV show response structure', () => {
			const result = serverSideTVShowsFilter(mockTVShows, 'the');
			
			expect(result).to.be.an('array');
			result.forEach(show => {
				expect(show).to.have.property('id').that.is.a('string');
				expect(show).to.have.property('mediaInfo').that.is.an('object');
				expect(show.mediaInfo).to.have.property('name').that.is.a('string');
				expect(show.mediaInfo).to.have.property('season').that.is.a('number');
				expect(show.mediaInfo).to.have.property('episode').that.is.a('number');
				expect(show).to.have.property('url').that.is.a('string');
				expect(show).to.have.property('fileExt').that.is.a('string');
			});
		});
	});
});