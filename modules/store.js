import { writable, derived } from 'svelte/store';

// filter dropdown for /live
export const isExpanded = writable(false);

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


// /live store
export const channels = writable([]);
export const filterValue = writable('');
export const selectedChannel = writable(null);
export const streamUrl = writable('');
export const selectedProvider = writable({});
export const isLoading = writable(false);
export const isChannelListOpen = writable(false);
export const mp4 = writable(false);

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
		return filtered;
	}
);