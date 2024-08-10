import fetch from 'node-fetch';
import { Surreal } from 'surrealdb.js';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv-flow';
import * as cheerio from 'cheerio';
import path from 'path';
import { parseMediaUrl } from '../../modules/parsers/mediainfo.js';
import { getArtistAndAlbumInfo } from '../../modules/parsers/providers.js';

const supportedExtensions = ['.mp3', '.mp4', '.wav', '.ogg', '.pdf', '.epub', '.mkv', '.m4a'];

config();

const { env } = process;
const db = new Surreal();
const {
	DB_HOST: host,
	DB_USER: username,
	DB_PASS: password,
	DB_PORT: port,
	DB_RPC_URL: url,
	DB_NS: namespace,
	DB_DB: database
} = env;

console.log(host, namespace, database, username, password);

async function connectToDB() {
	await db.connect(`${host}:${port}/rpc`, {
		namespace,
		database,
		auth: {
			username,
			password
		}
	});

	await db.signin({
		username,
		password
	});

	await db.use({
		namespace,
		database
	});
}

let crawlingSessions = {};

function sanitizeFile(filename) {
	const patternsToRemove = [
		/BluRay/i,
		/X265/i,
		/RARBG/i,
		/\[.*?\]/i,
		/WEB/i,
		/h264/i,
		/720p/i,
		/1080p/i,
		/BAE/i,
		/HD/i
	];

	let nameWithoutExtension = filename.replace(/\.[^/.]+$/, '');

	patternsToRemove.forEach((pattern) => {
		nameWithoutExtension = nameWithoutExtension.replace(pattern, '');
	});

	const seasonEpisodeMatch = nameWithoutExtension.match(/\.S(\d+)E(\d+)/i);
	let season = '';
	let episode = '';

	if (seasonEpisodeMatch) {
		season = seasonEpisodeMatch[1];
		episode = seasonEpisodeMatch[2];
	}

	nameWithoutExtension = nameWithoutExtension.replace(/\.S\d+E\d+/i, '');

	let cleanName = nameWithoutExtension.replace(/[\.\-]/g, ' ');
	cleanName = cleanName.replace(/\s+/g, ' ').trim();

	const capitalized = cleanName.replace(/\b\w/g, (char) => char.toUpperCase());
	const finalName =
		season && episode ? `${capitalized} (Season ${season}, Episode ${episode})` : capitalized;

	return finalName;
}

async function fetchUrl(url, user = null, pass = null) {
	const headers = {};
	if (user && pass) {
		const encodedCredentials = Buffer.from(`${user}:${pass}`).toString('base64');
		headers['Authorization'] = `Basic ${encodedCredentials}`;
	}

	const response = await fetch(url, { headers, redirect: 'follow' });
	if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	return response.text();
}

function parseHtmlForUrls(html, baseUrl, libraryId, user = null, pass = null) {
	const $ = cheerio.load(html);
	const files = [];
	const links = [];
	const visited = new Set();

	const baseHost = new URL(baseUrl).hostname;

	$('a').each((index, element) => {
		let href = $(element).attr('href');
		if (href && !href.startsWith('..') && !href.startsWith('/') && !href.startsWith('?')) {
			href = new URL(href, baseUrl).href;
			const hrefHost = new URL(href).hostname;

			// Skip offsite links
			if (hrefHost !== baseHost) {
				console.log('Skipping offsite link:', href);
				return;
			}

			if (href.endsWith('/')) {
				if (visited.has(href)) {
					console.log('href already seen:', href);
				} else {
					console.log('Adding directory:', href);
					visited.add(href);
					links.push(href);
				}
			} else if (supportedExtensions.some((ext) => href.endsWith(ext))) {
				const resolvedPath = new URL(href, baseUrl).pathname;
				const directoryPath = path.dirname(resolvedPath);
				const fileName = path.basename(resolvedPath);
				const fileExt = path.extname(resolvedPath).slice(1);

				const fileObject = {
					name: fileName,
					title: sanitizeFile(fileName),
					file: fileName,
					url: href,
					path: directoryPath,
					libraryId,
					fileExt
				};

				if (user && pass) {
					fileObject.user = user;
					fileObject.pass = pass;
				}

				console.log('adding file:', fileObject.url);
				files.push(fileObject);
			}
		}
	});

	return { files, links };
}

async function crawl(sessionId, libraryId, url, user = null, pass = null, delay = 1000) {
	if (!crawlingSessions[sessionId]?.isCrawling) return;
	console.log(`Crawling URL: ${url}`);

	try {
		const html = await fetchUrl(url, user, pass);
		const { files, links } = parseHtmlForUrls(html, url, libraryId, user, pass);

		for (const nextUrl of links) {
			if (!crawlingSessions[sessionId]?.isCrawling) return; // Early exit

			await new Promise((resolve) => setTimeout(resolve, delay)); // Rate limiting
			await crawl(sessionId, libraryId, nextUrl, user, pass, delay);

			// Update the session status only if it hasn't been stopped
			if (crawlingSessions[sessionId]?.isCrawling) {
				crawlingSessions[sessionId].libraryId = libraryId;
				crawlingSessions[sessionId].foundUrls.push(nextUrl);
				crawlingSessions[sessionId].urlCount += 1;

				if (crawlingSessions[sessionId].urlCount % 10 === 0) {
					await db.merge(sessionId, {
						foundUrls: crawlingSessions[sessionId].foundUrls,
						urlCount: crawlingSessions[sessionId].urlCount,
						libraryId: crawlingSessions[sessionId].libraryId // Ensure libraryId is preserved
					});
				}
			}
		}

		if (crawlingSessions[sessionId]?.isCrawling) {
			crawlingSessions[sessionId].foundUrls.push(...files.map((file) => file.url));
			crawlingSessions[sessionId].urlCount += files.length;

			if (files.length) {
				await db.merge(sessionId, {
					foundFiles: files,
					libraryId // Ensure libraryId is preserved
				});
				await save(files, libraryId);
			}
		}
	} catch (error) {
		console.error(`Error crawling ${url}: ${error.message} ${libraryId}, ${sessionId}`);
		await db.merge(sessionId, { status: 'failed', error: error.message, libraryId }); // Ensure libraryId is preserved
	}
}

async function save(files, libraryId) {
	const [library] = (
		await db.query('SELECT * FROM library WHERE id = $libraryId', { libraryId })
	).pop();
	const { createdBy } = library;

	for (let file of files) {
		file.createdAt = new Date();
		file.updatedAt = new Date();
		file.createdBy = createdBy;
		file.mediaInfo = parseMediaUrl(file.url);

		if (file.mediaInfo.videoType === 'movie' || file.mediaInfo.videoType === 'tv show') {
			try {
				const url = `https://www.omdbapi.com/?t=${file.mediaInfo.name}&apikey=${env.OMDB_API_KEY}`;
				console.log('fetching metadata:', url);
				const res = await fetch(url);

				if (res.ok) {
					file.omdb = await res.json();
				}
			} catch (err) {
				console.error(err, '<< while fetching:', url);
			}
		}

		if (file.mediaInfo.type === 'music') {
			const musicInfo = await getArtistAndAlbumInfo(file.mediaInfo.artist);

			const artist = musicInfo.artist;
			const album = musicInfo.albums
				.filter((album) => {
					if (file.mediaInfo.album && album.title) {
						return file.mediaInfo.album
							.toLowerCase()
							.includes(album.title.toLowerCase());
					}
				})
				.pop();
			console.log(album, '<<<<album matches');
			file.musicbrainz = { ...artist, ...album };
		}

		try {
			await db.create('media_files', file);
		} catch (err) {
			console.error('Could not create file in db: ', file);

			try {
				const { url } = file;
				const [oldFile] = (
					await db.query(
						`SELECT * FROM media_files WHERE url = $url AND libraryId = $libraryId`,
						{
							url,
							libraryId
						}
					)
				).pop();

				if (oldFile.id) {
					await db.merge(oldFile.id, file);
					console.log('Updated existing file:', oldFile.id);
				}
			} catch (err) {
				console.error(err);
			}
		}
	}

	console.log(`Saved ${files.length} files to db`);
}

export async function startCrawling(libraryId, sessionId = null) {
	let startUrl;
	let library;

	if (libraryId) {
		// Rescan so old files are removed...we delete them first.
		await db.query('DELETE FROM media_files WHERE libraryId = $libraryId', { libraryId });

		const [res] = (
			await db.query('SELECT * FROM library WHERE id = $libraryId', { libraryId })
		).pop();

		if (!res) {
			throw new Error(`Library with id ${libraryId} not found`);
		}

		startUrl = res.url.endsWith('/') ? res.url : `${res.url}/`;
		library = res;
	} else if (sessionId) {
		// If we have a sessionId, fetch the associated libraryId and library details.
		const [session] = (
			await db.query('SELECT * FROM crawl_status WHERE id = $sessionId', { sessionId })
		).pop();

		if (!session) {
			throw new Error(`Session with id ${sessionId} not found`);
		}

		const [res] = await db
			.query('SELECT * FROM library WHERE id = $libraryId', {
				libraryId: session.libraryId
			})
			.pop();

		if (!res) {
			throw new Error(`Library with id ${session.libraryId} not found`);
		}

		library = res;
		startUrl = library.url.endsWith('/') ? library.url : `${library.url}/`;
	}

	if (!library) {
		throw new Error(
			`Could not start crawling. Library is undefined for libraryId ${libraryId} or sessionId ${sessionId}`
		);
	}

	// If no sessionId is provided, create a new crawl session
	if (!sessionId) {
		const sessionData = {
			libraryId,
			currentUrl: startUrl,
			status: 'running',
			foundUrls: [],
			urlCount: 0,
			error: null
		};

		const [newSession] = await db.create('crawl_status', sessionData);
		sessionId = newSession.id;
	} else {
		// Ensure session status is updated to 'running' before starting the crawl
		await db.merge(sessionId, {
			status: 'running',
			libraryId, // Ensure libraryId is preserved
			currentUrl: startUrl
		});
	}

	crawlingSessions[sessionId] = { isCrawling: true, foundUrls: [], urlCount: 0 };

	const { user, pass } = library;

	crawl(sessionId, library.id, startUrl, user, pass).then(async () => {
		// Only set the status to "completed" if the session was not stopped
		if (crawlingSessions[sessionId]?.isCrawling) {
			crawlingSessions[sessionId].isCrawling = false;
			await db.merge(sessionId, {
				status: 'completed',
				currentUrl: null,
				foundUrls: crawlingSessions[sessionId].foundUrls,
				urlCount: crawlingSessions[sessionId].urlCount,
				libraryId // Ensure libraryId is preserved
			});
		}
		delete crawlingSessions[sessionId];
		console.log('Finished crawling:', sessionId, startUrl);
	});

	return { sessionId, startUrl };
}

export async function stopCrawling(sessionId) {
	if (crawlingSessions[sessionId]) {
		crawlingSessions[sessionId].isCrawling = false;
		await db.merge(sessionId, {
			status: 'stopped',
			currentUrl: null,
			libraryId: crawlingSessions[sessionId].libraryId // Ensure libraryId is preserved
		});
	}
}

export async function getCrawlStatus(sessionId) {
	const status = await db.select(sessionId);
	return status;
}

export async function listSessions() {
	const sessions = await db.select('crawl_status');
	return sessions;
}

export async function startAllCrawling() {
	const sessions = await listSessions();
	for (const session of sessions) {
		console.log(session.id, 'checking status:', session.status);
		if (session.status === 'stopped') {
			await startCrawling(session.libraryId, session.id); // Ensure await to handle async properly
		}
	}
}

export async function stopAllCrawling() {
	const sessions = await listSessions();
	sessions.forEach((session) => {
		console.log(session.id, 'stopping!', session.status);
		if (session.status === 'running') {
			stopCrawling(session.id);
		}
	});
}

// Connect to DB on initialization
await connectToDB();
