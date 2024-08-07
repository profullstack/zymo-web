import { writable } from 'svelte/store';

// filter dropdown for /live
export const isExpanded = writable(false);

// global media player
export const audioContext = writable(null);
export const audioElement = writable(null);
export const isPlaying = writable(false);
export const playlist = writable([]);
export const currentSongIndex = writable(0);
export const currentSongMetadata = writable({ artist: '', album: '', songname: '' });
