async function getTVShowInfo(tvShowTitle) {
	const apiKey = 'YOUR_TMDB_API_KEY'; // Replace with your TMDb API key
	const baseURL = 'https://api.themoviedb.org/3';

	try {
		// Fetch TV show data
		let response = await fetch(
			`${baseURL}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(tvShowTitle)}`
		);
		let tvShowData = await response.json();

		if (tvShowData.results.length === 0) {
			throw new Error('TV show not found');
		}

		let tvShow = tvShowData.results[0];
		let tvShowID = tvShow.id;

		// Fetch detailed TV show info
		response = await fetch(`${baseURL}/tv/${tvShowID}?api_key=${apiKey}`);
		let tvShowDetails = await response.json();

		// Fetch TV show images
		response = await fetch(`${baseURL}/tv/${tvShowID}/images?api_key=${apiKey}`);
		let imagesData = await response.json();

		let posters = imagesData.posters.map(
			(poster) => `https://image.tmdb.org/t/p/w500${poster.file_path}`
		);

		return {
			title: tvShowDetails.name,
			overview: tvShowDetails.overview,
			firstAirDate: tvShowDetails.first_air_date,
			genres: tvShowDetails.genres.map((genre) => genre.name),
			images: posters
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return null;
	}
}

// Example usage
// getTVShowInfo('Breaking Bad').then((info) => console.log(info));

async function getMovieInfo(movieTitle) {
	const apiKey = 'YOUR_TMDB_API_KEY'; // Replace with your TMDb API key
	const baseURL = 'https://api.themoviedb.org/3';

	try {
		// Fetch movie data
		let response = await fetch(
			`${baseURL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieTitle)}`
		);
		let movieData = await response.json();

		if (movieData.results.length === 0) {
			throw new Error('Movie not found');
		}

		let movie = movieData.results[0];
		let movieID = movie.id;

		// Fetch detailed movie info
		response = await fetch(`${baseURL}/movie/${movieID}?api_key=${apiKey}`);
		let movieDetails = await response.json();

		// Fetch movie images
		response = await fetch(`${baseURL}/movie/${movieID}/images?api_key=${apiKey}`);
		let imagesData = await response.json();

		let posters = imagesData.posters.map(
			(poster) => `https://image.tmdb.org/t/p/w500${poster.file_path}`
		);

		return {
			title: movieDetails.title,
			overview: movieDetails.overview,
			releaseDate: movieDetails.release_date,
			genres: movieDetails.genres.map((genre) => genre.name),
			images: posters
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return null;
	}
}

// Example usage
// getMovieInfo('Inception').then((info) => console.log(info));

export async function getArtistAndAlbumInfo(artistName) {
	const baseURL = 'https://musicbrainz.org/ws/2';
	const queryURL = `${baseURL}/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json`;

	try {
		// Fetch artist data
		let response = await fetch(queryURL);
		let artistData = await response.json();

		console.log(artistData);
		process.exit(1);

		if (artistData.artists.length === 0) {
			throw new Error('Artist not found');
		}

		let artist = artistData.artists[0];
		let artistID = artist.id;

		// Fetch artist's albums
		response = await fetch(`${baseURL}/release-group?artist=${artistID}&type=album&fmt=json`);
		let albumData = await response.json();

		let albums = albumData['release-groups'];

		// Fetch cover art for each album from Cover Art Archive
		for (let album of albums) {
			try {
				let coverArtResponse = await fetch(
					`https://coverartarchive.org/release-group/${album.id}`
				);
				if (coverArtResponse.ok) {
					let coverArtData = await coverArtResponse.json();
					album.coverArt = coverArtData.images[0].thumbnails.small;
				} else {
					album.coverArt = 'No image available';
				}
			} catch (error) {
				album.coverArt = 'No image available';
			}
		}

		return {
			artist: {
				name: artist.name,
				id: artist.id,
				disambiguation: artist.disambiguation || 'N/A'
			},
			albums: albums.map((album) => ({
				title: album.title,
				id: album.id,
				coverArt: album.coverArt
			}))
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return null;
	}
}

// Example usage
// getArtistAndAlbumInfo('Radiohead').then((info) => console.log(info));
