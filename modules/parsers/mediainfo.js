const patterns = {
	season: /([Ss]?([0-9]{1,2}))[Eex]/,
	episode: /([Eex]([0-9]{2})(?:[^0-9]|$))/,
	year: /([\[\(]?((?:19[0-9]|20[01])[0-9])[\]\)]?)/,
	resolution: /(([0-9]{3,4}p))[^M]/,
	quality:
		/(?:PPV\.)?[HP]DTV|(?:HD)?CAM|B[rR]Rip|TS|(?:PPV )?WEB-?DL(?: DVDRip)?|H[dD]Rip|DVDRip|DVDRiP|DVDRIP|CamRip|W[EB]B[rR]ip|[Bb]lu[Rr]ay|DvDScr|hdtv/,
	codec: /xvid|x264|h\.?264/i,
	audio: /MP3|DD5\.?1|Dual[\- ]Audio|LiNE|DTS|AAC(?:\.?2\.0)?|AC3(?:\.5\.1)?/,
	group: /(- ?([^-]+(?:-={[^-]+-?$)?))\..{0,3}$/,
	region: /R[0-9]/,
	extended: /EXTENDED/,
	hardcoded: /HC/,
	proper: /PROPER/,
	repack: /REPACK/,
	container: /MKV|AVI/,
	widescreen: /WS/,
	website: /^(\[ ?([^\]]+?) ?\])/,
	language: /rus\.eng/,
	garbage: /1400Mb|3rd Nov| ((Rip))/
};
const types = {
	season: 'integer',
	episode: 'integer',
	year: 'integer',
	extended: 'boolean',
	hardcoded: 'boolean',
	proper: 'boolean',
	repack: 'boolean',
	widescreen: 'boolean'
};

function parseMediaInfo(filename) {
	let mediaInfo = {};
	let key,
		match,
		index,
		clean,
		part,
		start = 0,
		end,
		raw;

	for (key in patterns) {
		if (patterns.hasOwnProperty(key)) {
			if (!(match = filename.match(patterns[key]))) {
				continue;
			}

			index = {
				raw: match[1] ? 1 : 0,
				clean: match[1] ? 2 : 0
			};

			if (types[key] && types[key] === 'boolean') {
				clean = true;
			} else {
				clean = match[index.clean];

				if (types[key] && types[key] === 'integer') {
					clean = parseInt(clean, 10);
				}
			}

			if (key === 'group') {
				if (clean.match(patterns.codec) || clean.match(patterns.quality)) {
					continue;
				}

				if (clean.match(/[^ ]+ [^ ]+ .+/)) {
					key = 'episodeName';
				}
			}

			part = {
				name: key,
				match: match,
				raw: match[index.raw],
				clean: clean
			};

			mediaInfo[part.name] = part.clean;

			raw = end ? filename.substr(start, end - start).split('(')[0] : filename;
			clean = raw;

			// clean up title
			clean = raw.replace(/^ -/, '');

			if (clean.indexOf(' ') === -1 && clean.indexOf('.') !== -1) {
				clean = clean.replace(/\./g, ' ');
			}

			clean = clean.replace(/_/g, ' ');
			clean = clean.replace(/([\(_]|- )$/, '').trim();

			mediaInfo = {
				...mediaInfo,
				...{
					rawName: raw,
					name: clean
				}
			};

			if (!part.match) {
				return;
			}

			if (part.match.index === 0) {
				start = part.match[0].length;

				return;
			}

			if (!end || part.match.index < end) {
				end = part.match.index;
			}

			if (key === 'episode') {
				mediaInfo.name?.replace(part.raw, '{episode}');
			}
		}
	}

	mediaInfo.filename = filename;

	return mediaInfo;
}

function decodeURIComponentSafe(encoded) {
	try {
		return decodeURIComponent(encoded);
	} catch (e) {
		return encoded.replace(/%[0-9A-F]{2}/gi, (match) => {
			try {
				return String.fromCharCode(parseInt(match.slice(1), 16));
			} catch {
				return match;
			}
		});
	}
}

function parseMusicUrl(pathname) {
	const parts = pathname.split('/').filter(Boolean).map(decodeURIComponentSafe);
	const file = parts.pop();
	const songname = file.replace(/\.(mp3|m4a|wav)$/, '');
	const album = parts.pop();
	const artist = parts.pop();
	const unparsed = parts.pop() || 'unparsed';

	return {
		type: 'music',
		artist: artist || '',
		album: album || '',
		songname: songname,
		filename: file,
		unparsed: unparsed
	};
}

function parseVideoUrl(pathname) {
	const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
	const mediaInfo = parseMediaInfo(filename);
	const parts = pathname.split('/').filter(Boolean).map(decodeURIComponentSafe);

	let videoType = 'movie';
	if (mediaInfo.season !== undefined && mediaInfo.episode !== undefined) {
		videoType = 'tv show';
	}

	return {
		type: 'video',
		videoType: videoType,
		...mediaInfo,
		parts
	};
}

export function parseMediaUrl(url) {
	const urlObj = new URL(url);
	const pathname = urlObj.pathname;
	const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

	let mediaInfo = parseMediaInfo(filename);

	if (filename.match(/\.(mp3|m4a|wav)$/i)) {
		mediaInfo = {
			...mediaInfo,
			...parseMusicUrl(pathname)
		};
	} else if (filename.match(/\.(mov|mp4|mkv|webm|avi)$/i)) {
		mediaInfo = {
			...mediaInfo,
			...parseVideoUrl(pathname)
		};
	} else if (filename.match(/\.(pdf|epub)$/i)) {
		mediaInfo = {
			...mediaInfo,
			...parseBookUrl(pathname)
		};
	} else {
		return null; // Unsupported file type
	}

	return mediaInfo;
}

function parseBookUrl(pathname) {
	const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
	const bookTitle = filename
		.replace(/\.(pdf|epub)$/i, '')
		.replace(/_/g, ' ')
		.replace(/\./g, ' ');

	return {
		type: 'book',
		title: bookTitle,
		filename: filename
	};
}

export async function fetchBookMetadata(title) {
	//openlibrary.org doesn't like "by ${author}" but ${author} alone works fine
	const originalTitle = decodeURIComponent(title).replace(/\sby\s/gi, ' ');

	const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(originalTitle)}&mode=everything`;
				       //openlibrary.org/search.json?q=Mastering+Node+js+Web+Development+adam+freeman&mode=everything
	https: console.log('fetch book metadata:', url);

	try {
		const res = await fetch(url);
		if (res.ok) {
			const data = await res.json();
			if (data.docs && data.docs.length > 0) {
				const book = data.docs[0]; // Take the first result
				return {
					title: book.title,
					author: book.author_name?.join(', '),
					publish_date: book.first_publish_year,
					isbn: book.isbn?.[0],
					cover: book.cover_i
						? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
						: null
				};
			}
		}
	} catch (err) {
		console.error('Error fetching book metadata:', err);
	}
	return null;
}
