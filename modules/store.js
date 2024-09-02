import { writable, derived } from 'svelte/store';

// filter dropdown for /live
export const isExpanded = writable(false);
export const currentPath = writable('/');

// music store and player
export const audioContext = writable(null);
export const audioElement = writable(null);
export const isPlaying = writable(false);
export const playlist = writable([]);
export const currentSongIndex = writable(0);
export const currentSongMetadata = writable({});
export const isMuted = writable(false);
export const volumeLevel = writable(1);
export const seekPosition = writable(0); // Add this line
export const isInitialized = writable(false);

// /live store
export const channels = writable([]);
export const filterValue = writable('');
export const selectedChannel = writable(null);
export const streamUrl = writable('');
export const selectedProvider = writable(false);
export const isLoading = writable(false);
export const isChannelListOpen = writable(false);
export const mp4 = writable(false);

export const transcodeStore = writable(false);
export const proxyStore = writable(false);

export const filteredChannels = derived(
	[channels, filterValue, mp4],
	([$channels, $filterValue, $mp4]) => {
		let filtered = $channels;
		if ($filterValue !== '') {
			filtered = filtered.filter((channel) =>
				channel.name.toLowerCase().includes($filterValue.toLowerCase())
			);
		}
		if ($mp4) {
			filtered = filtered.filter((channel) => channel.url.endsWith('.mp4'));
		}

		// sort channels alphabetically by name
		filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));

		return filtered;
	}
);

// EPG
export const epgStore = writable({
	isLoading: true,
	error: null,
	channels: [],
	epgData: {},
	timeBlocks: []
});

export function setEPGData({ channels, epgData, timeBlocks }) {
	epgStore.set({
		isLoading: false,
		error: null,
		channels,
		epgData,
		timeBlocks
	});
}

export function setEPGError(error) {
	epgStore.set({
		isLoading: false,
		error,
		channels: [],
		epgData: {},
		timeBlocks: []
	});
}
