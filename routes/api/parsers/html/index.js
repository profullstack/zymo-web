export default {
	async get(request) {
		const { store, query } = request;
		const {
			parsers: { HTML }
		} = store;

		const id = query.get('id');
		const { CRAWLER_PORT } = process.env;

		// Set up SSE headers
		const headers = {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		};

		// Proxy the SSE connection from the crawler
		try {
			const crawlerUrl = `http://localhost:${CRAWLER_PORT}/start-crawl-sse/${id}`;
			const response = await fetch(crawlerUrl);

			if (!response.ok) {
				throw new Error(`Crawler returned ${response.status}`);
			}

			// Stream the response from crawler to client
			return new Response(response.body, { headers });
		} catch (error) {
			// If crawler connection fails, send error event
			const stream = new ReadableStream({
				start(controller) {
					const encoder = new TextEncoder();
					const message = `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`;
					controller.enqueue(encoder.encode(message));
					controller.close();
				}
			});
			return new Response(stream, { headers });
		}
	}
};
