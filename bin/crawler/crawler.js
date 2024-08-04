import fetch from 'node-fetch';
import { Surreal } from 'surrealdb.js';
import { v4 as uuidv4 } from 'uuid';

const db = new Surreal('http://localhost:8000/rpc');

async function connectToDB() {
	await db.signin({ user: 'root', pass: 'root' });
	await db.use('test', 'test');
}

let isCrawling = false;
let crawlData = {};

async function fetchUrl(url) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	return response.text();
}

async function crawl(sessionId, url, delay = 1000) {
	if (!isCrawling) return;
	console.log(`Crawling URL: ${url}`);

	try {
		const html = await fetchUrl(url);
		const urls = extractUrls(html); // Implement this function to extract URLs from the HTML

		for (const nextUrl of urls) {
			if (!isCrawling) break;
			await crawl(sessionId, nextUrl, delay);
			await new Promise((resolve) => setTimeout(resolve, delay)); // Rate limiting

			// Update crawl data
			crawlData[sessionId].foundUrls.push(nextUrl);
			crawlData[sessionId].urlCount += 1;

			// Periodically update the database
			if (crawlData[sessionId].urlCount % 10 === 0) {
				await db.update(`crawl_status:${sessionId}`, {
					foundUrls: crawlData[sessionId].foundUrls,
					urlCount: crawlData[sessionId].urlCount
				});
			}
		}
	} catch (error) {
		console.error(`Error crawling ${url}: ${error.message}`);
		await db.update(`crawl_status:${sessionId}`, { error: error.message });
	}
}

export async function startCrawling(startUrl, sessionId = null) {
	if (!sessionId) {
		sessionId = uuidv4();
		await db.create('crawl_status', {
			id: sessionId,
			currentUrl: startUrl,
			status: 'running',
			foundUrls: [],
			urlCount: 0,
			error: null
		});
	} else {
		await db.update(`crawl_status:${sessionId}`, {
			currentUrl: startUrl,
			status: 'running',
			foundUrls: [],
			urlCount: 0,
			error: null
		});
	}

	isCrawling = true;
	crawlData[sessionId] = { foundUrls: [], urlCount: 0 };
	crawl(sessionId, startUrl).then(async () => {
		isCrawling = false;
		await db.update(`crawl_status:${sessionId}`, {
			status: 'completed',
			currentUrl: null,
			foundUrls: crawlData[sessionId].foundUrls,
			urlCount: crawlData[sessionId].urlCount
		});
		delete crawlData[sessionId];
	});

	return { sessionId, startUrl };
}

export async function stopCrawling(sessionId) {
	isCrawling = false;
	await db.update(`crawl_status:${sessionId}`, { status: 'stopped', currentUrl: null });
}

export async function getCrawlStatus(sessionId) {
	const status = await db.select(`crawl_status:${sessionId}`);
	return status;
}

export async function listSessions() {
	const sessions = await db.select('crawl_status');
	return sessions;
}

export async function startAllCrawling() {
	const sessions = await listSessions();
	sessions.forEach((session) => {
		if (session.status !== 'running') {
			startCrawling(session.currentUrl, session.id);
		}
	});
}

export async function stopAllCrawling() {
	const sessions = await listSessions();
	sessions.forEach((session) => {
		if (session.status === 'running') {
			stopCrawling(session.id);
		}
	});
}

function extractUrls(html) {
	// Implement URL extraction logic here
	return [];
}

// Connect to DB on initialization
connectToDB();
