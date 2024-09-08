import fetch from 'node-fetch';
import readline from 'readline';

// Environment variables
const CLIENT_ID = 'disney-svod-3d9324fc';
const CLIENT_VERSION = '9.10.0';
const CONFIG_URL = `https://bam-sdk-configs.bamgrid.com/bam-sdk/v5.0/${CLIENT_ID}/android/v${CLIENT_VERSION}/google/tv/prod.json`;

// GraphQL Mutation for registering a device
const REGISTER_DEVICE = `mutation ($registerDevice: RegisterDeviceInput!) {
  registerDevice(registerDevice: $registerDevice) {
    __typename
  }
}`;

// In-memory store for configuration and authentication token
let configData = null;
let authToken = '';

// Helper function to get input from the command line
function prompt(question) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

// Fetch configuration data
async function fetchConfig() {
	const response = await fetch(CONFIG_URL);
	if (!response.ok) throw new Error('Failed to fetch configuration');
	configData = await response.json();
}

// Get dynamic endpoint URL from configuration
async function getEndpoint(name) {
	if (!configData) await fetchConfig();
	return configData.services.orchestration.client.endpoints[name].href;
}

// API functions
export const api = {
	async registerDevice(email, password) {
		const registerEndpoint = await getEndpoint('registerDevice'); // Fetch dynamic endpoint

		// Define the registration payload with device attributes and the GraphQL mutation
		const payload = {
			query: REGISTER_DEVICE,
			variables: {
				registerDevice: {
					applicationRuntime: 'android',
					attributes: {
						operatingSystem: 'Android',
						operatingSystemVersion: '8.1.0'
					},
					deviceFamily: 'android',
					deviceLanguage: 'en',
					deviceProfile: 'tv',
					email: email, // Include the email
					password: password // Include the password
				}
			}
		};

		const response = await fetch(registerEndpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!response.ok) throw new Error(await response.text());
		const data = await response.json();
		return data.token;
	},

	async search(query) {
		const searchEndpoint = await getEndpoint('search'); // Fetch dynamic endpoint
		const response = await fetch(`${searchEndpoint}?query=${encodeURIComponent(query)}`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${authToken}` }
		});

		if (!response.ok) throw new Error('Search failed');
		const data = await response.json();
		return data.hits.map((hit) => hit.hit);
	},

	async getPlayUrl(contentId) {
		const playEndpoint = await getEndpoint('play'); // Fetch dynamic endpoint
		const response = await fetch(`${playEndpoint}/${contentId}`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${authToken}` }
		});

		if (!response.ok) throw new Error('Failed to retrieve play URL');
		const data = await response.json();
		return data.playUrl;
	}
};

// Login function
export async function login() {
	const email = await prompt('Enter your email: ');
	const password = await prompt('Enter your password: ');

	if (!email || !password) {
		console.error('Email and password are required.');
		return;
	}

	try {
		authToken = await api.registerDevice(email, password);
		console.log('Logged in successfully');
	} catch (error) {
		console.error('Login failed:', error.message);
	}
}

// Search function
export async function search(query) {
	try {
		const results = await api.search(query);
		console.log('Search results:', results);
	} catch (error) {
		console.error('Search error:', error.message);
	}
}

// Play function
export async function play(contentId) {
	try {
		const playUrl = await api.getPlayUrl(contentId);
		console.log('Playing stream from URL:', playUrl);
		// Additional handling for playback, e.g., passing to an external player
	} catch (error) {
		console.error('Playback error:', error.message);
	}
}

// Example usage
(async () => {
	await fetchConfig(); // Fetch configuration at the start
	await login();
	await search('example query');
	await play('content_id_example');
})();
