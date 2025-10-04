export default {
	async get(request) {
		const { store, query } = request;
		const {
			parsers: { HTML },
			library: { Library }
		} = store;

		const id = query.get('id');
		const save = query.get('save');

		// Set up SSE headers
		const headers = {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		};

		// Create a readable stream for SSE
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				// Helper to send SSE message
				const sendEvent = (event, data) => {
					const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
					controller.enqueue(encoder.encode(message));
				};

				try {
					// Get library details
					const library = await Library.getById(id);

					if (!library) {
						sendEvent('error', { message: 'Library not found' });
						controller.close();
						return;
					}

					sendEvent('start', { libraryId: id, url: library.url });

					// Parse with progress callback
					const foundFiles = await HTML.parseIndexPageWithProgress(
						id,
						library.url,
						library.user,
						library.pass,
						save ? 1 : 0,
						(file) => {
							// Send each file as it's found
							sendEvent('file', file);
						}
					);

					// Send completion event
					sendEvent('complete', {
						totalFiles: foundFiles.length,
						libraryId: id
					});
				} catch (error) {
					sendEvent('error', {
						message: error.message || 'Scan failed'
					});
				} finally {
					controller.close();
				}
			}
		});

		return new Response(stream, { headers });
	}
};
