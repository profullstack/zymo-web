import express from 'express';
import {
	startCrawling,
	stopCrawling,
	getCrawlStatus,
	listSessions,
	startAllCrawling,
	stopAllCrawling
} from './crawler.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/start-crawl', async (req, res) => {
	const { sessionId, url } = req.body;
	if (!url) {
		return res.status(400).send({ error: 'URL is required' });
	}
	const session = await startCrawling(url, sessionId);
	res.send({ message: 'Crawling started', session });
});

app.post('/stop-crawl', async (req, res) => {
	const { sessionId } = req.body;
	if (!sessionId) {
		return res.status(400).send({ error: 'Session ID is required' });
	}
	await stopCrawling(sessionId);
	res.send({ message: 'Crawling stopped', sessionId });
});

app.get('/crawl-status/:sessionId', async (req, res) => {
	const { sessionId } = req.params;
	const status = await getCrawlStatus(sessionId);
	res.send(status);
});

app.get('/sessions', async (req, res) => {
	const sessions = await listSessions();
	res.send(sessions);
});

app.post('/start-all', async (req, res) => {
	await startAllCrawling();
	res.send({ message: 'All crawling sessions started' });
});

app.post('/stop-all', async (req, res) => {
	await stopAllCrawling();
	res.send({ message: 'All crawling sessions stopped' });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
