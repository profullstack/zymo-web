export async function fetchWithTimeout(url, options = {}, timeout = 20000) {
	options.headers = options.headers ?? {};
	options.headers['user-agent'] =
		'Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0';
	// Create a race between the fetch request and a timeout promise
	const responsePromise = fetch(url, options);
	const timeoutPromise = new Promise((_, reject) =>
		setTimeout(() => reject(new Error('Request timed out')), timeout)
	);

	try {
		// Wait for either the fetch to resolve or the timeout to occur
		const response = await Promise.race([responsePromise, timeoutPromise]);

		if (!response.ok) {
			throw new Error(`Fetch failed with status: ${response.status}`);
		}

		return response;
	} catch (error) {
		throw error;
	}
}
