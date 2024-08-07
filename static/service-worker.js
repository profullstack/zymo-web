self.addEventListener('install', function (event) {
	console.log('Service Worker: Installed');
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
	console.log('Service Worker: Activated');
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
	// Handle fetch events if needed
	// console.log('Fetch event:', event.request.url);
});

let audioContext;
let audioBuffer;
let source;

self.addEventListener('message', async (event) => {
	console.log('Service Worker: Received message:', event.data);

	if (event.data.action === 'play') {
		const url = event.data.url;
		console.log('Play action received for URL:', url);

		if (!audioContext) {
			audioContext = new AudioContext();
		}

		const response = await fetch(url);
		const arrayBuffer = await response.arrayBuffer();
		audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

		source = audioContext.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(audioContext.destination);
		source.start(0);
		console.log('Audio started playing.');
	}

	if (event.data.action === 'stop') {
		if (source) {
			source.stop();
			console.log('Audio stopped.');
		}
	}
});
