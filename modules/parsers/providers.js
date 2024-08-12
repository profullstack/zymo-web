
export async function getArtistAndAlbumInfo(artistName) {
	const baseURL = 'https://musicbrainz.org/ws/2';
	const queryURL = `${baseURL}/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json`;

	try {
		// Fetch artist data
		let response = await fetch(queryURL, {
			headers: {
				'user-agent': 'Zymo Crawler/1.0.0 ( http://zymo.tv )'
			}
		});
		let artistData = await response.json();

		// console.log(artistData, '<<<< artistData');

		if (artistData.artists.length === 0) {
			throw new Error('Artist not found');
		}

		let artist = artistData.artists[0];
		let artistID = artist.id;

		// Fetch artist's albums
		response = await fetch(`${baseURL}/release-group?artist=${artistID}&type=album&fmt=json`, {
			headers: {
				'user-agent': 'Zymo Crawler/1.0.0 ( http://zymo.tv )'
			}
		});
		let albumData = await response.json();

		// console.log(albumData, '<<< albumData');

		let albums = albumData['release-groups'];

		// Fetch cover art for each album from Cover Art Archive
		for (let album of albums) {
			try {
				let coverArtResponse = await fetch(
					`https://coverartarchive.org/release-group/${album.id}`,
					{
						headers: {
							'user-agent': 'Zymo Crawler/1.0.0 ( http://zymo.tv )'
						}
					}
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
