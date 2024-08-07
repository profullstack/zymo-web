/**
 * Pattern should contain either none or two capturing groups.
 * In case of two groups - 1st is raw, 2nd is clean.
 * https://github.com/jzjzjzj/parse-torrent-name/blob/master/parts/common.js
 */
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

let mediaInfo = {};

export function parseMediaInfo(filename) {
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
