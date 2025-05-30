import primary from '@primate/types/primary';
import * as cheerio from 'cheerio';
import path from 'path';

import { getMe } from '../../modules/user.js';

const { env } = process;
const supportedExtensions = ['.mp3', '.mp4', '.wav', '.ogg', '.pdf', '.epub', '.mkv'];

function sanitizeFile(filename) {
	// List of common patterns to remove
	const patternsToRemove = [
		/BluRay/i,
		/X265/i,
		/RARBG/i,
		/\[.*?\]/i, // Remove anything inside square brackets
		/WEB/i,
		/h264/i,
		/720p/i,
		/1080p/i,
		/BAE/i,
		/HD/i
	];

	// Remove file extension
	let nameWithoutExtension = filename.replace(/\.[^/.]+$/, '');

	// Remove patterns
	patternsToRemove.forEach((pattern) => {
		nameWithoutExtension = nameWithoutExtension.replace(pattern, '');
	});

	// Extract season and episode numbers
	const seasonEpisodeMatch = nameWithoutExtension.match(/\.S(\d+)E(\d+)/i);
	let season = '';
	let episode = '';

	if (seasonEpisodeMatch) {
		season = seasonEpisodeMatch[1];
		episode = seasonEpisodeMatch[2];
	}

	// Remove season and episode numbers after extraction
	nameWithoutExtension = nameWithoutExtension.replace(/\.S\d+E\d+/i, '');

	// Replace dots and hyphens with spaces
	let cleanName = nameWithoutExtension.replace(/[\.\-]/g, ' ');

	// Replace multiple spaces with a single space and trim
	cleanName = cleanName.replace(/\s+/g, ' ').trim();

	// Capitalize the first letter of each word
	const capitalized = cleanName.replace(/\b\w/g, (char) => char.toUpperCase());

	// Construct the final string with season and episode info if available
	const finalName =
		season && episode ? `${capitalized} (Season ${season}, Episode ${episode})` : capitalized;

	return finalName;
}

export const actions = ({ connection: db }) => {
	return {
		me: async () => {
			return await getMe(db);
		},
		async parseIndexPage(libraryId, url, user = null, pass = null, save = 0) {
			try {
				// url will only be for directories, we don't fetch individual files so this is fine to end with /
				if (!url.endsWith('/')) {
					url += '/';
				}
				console.log('parsing:', url);
				const headers = {};
				if (user && pass) {
					const encodedCredentials = Buffer.from(`${user}:${pass}`).toString('base64');
					headers['Authorization'] = `Basic ${encodedCredentials}`;
				}

				const response = await fetch(url, { headers, redirect: 'follow' });

				if (response.status === 401) {
					console.error('Authentication required');
					return { message: 'Authentication required' };
				}

				const data = await response.text();
				const $ = cheerio.load(data);

				const files = [];
				const links = [];

				$('a').each((index, element) => {
					const href = $(element).attr('href');
					if (href) {
						const resolvedUrl = new URL(href, url).href;
						const resolvedPath = new URL(href, url).pathname;
						if (href.endsWith('/') && !href.startsWith('..')) {
							console.log('found directory:', href);
							links.push(resolvedUrl);
						} else if (supportedExtensions.some((ext) => href.endsWith(ext))) {
							const directoryPath = path.dirname(resolvedPath);
							const fileName = path.basename(resolvedPath);
							const fileExt = path.extname(resolvedPath).slice(1);

							const fileObject = {
								name: fileName,
								title: sanitizeFile(fileName),
								file: fileName,
								url: resolvedUrl,
								path: directoryPath,
								libraryId,
								fileExt
							};

							if (user && pass) {
								fileObject.user = user;
								fileObject.pass = pass;
							}

							console.log('found file:', fileObject);
							files.push(fileObject);
						}
					}
				});

				for (const link of links) {
					console.log('parsing sub-directories:', link);
					const subFiles = await this.parseIndexPage(libraryId, link, user, pass);
					files.push(...subFiles);
				}

				// save them if flag is set to 1
				if (save && files.length) {
					await this.save(files, libraryId);
				}

				return files;
			} catch (error) {
				console.error('Error fetching or parsing the index page:', error);
				return [];
			}
		},

		async save(files, libraryId) {
			const { id } = await this.me();
			for (let file of files) {
				file.createdAt = new Date();
				file.updatedAt = new Date();
				file.createdBy = id;

				try {
					await db.create('media_files', file);
				} catch (err) {
					console.error(err);

					/*

					INSERT INTO city (id, population, at_year) VALUES ("Calgary", 1665000, 2024)
ON DUPLICATE KEY UPDATE
	population = $input.population,
	at_year = $input.at_year;
	*/
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

						console.log('trying to update ', oldFile.id);
						if (oldFile.id) {
							await db.merge(oldFile.id, file);
							console.log('updated old file with new file data:', oldFile.id);
						}
					} catch (err) {
						console.error(err);
					}
				}
			}

			console.log('Saved files to db');
		},

		async startCrawler(libraryId, sessionId) {
			const { CRAWLER_PORT } = env;
			console.log('libraryId:', libraryId, 'sessionId:', sessionId);

			const crawlerApi = `http://localhost:${CRAWLER_PORT}`;
			const startUrl = `${crawlerApi}/start-crawl`;

			try {
				const res = await fetch(startUrl, {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						libraryId,
						sessionId
					})
				});

				if (!res.ok) {
					throw await res.json();
				}

				return await res.json();
			} catch (err) {
				console.error(err);
				throw err;
			}
		}
	};
};

export default {
	id: primary
};
