// player.js

import Hls from 'hls.js';
import { get } from 'svelte/store';
import {
	streamUrl,
	selectedChannel,
	isLoading,
	channels,
	isChannelListOpen,
	proxyStore,
	transcodeStore,
	setEPGError,
	setEPGData
} from './store.js';

let currentTime = new Date();
currentTime.setMinutes(0, 0, 0);

let endTime = new Date(currentTime);
endTime.setHours(currentTime.getHours() + 24);

// Function to transcode the media URL
export function transcodeMedia(url, videoRef) {
	url = `/api/transcode?url=${encodeURIComponent(url)}`;
	streamUrl.set(url);
	updateVideoSource(videoRef, url, 'mp4');
}

// Function to play an HLS stream
export function playHLSStream(url, videoRef, proxy) {
	if (proxy) {
		url = `/proxy?url=${encodeURIComponent(url)}`;
	}

	if (Hls.isSupported()) {
		const hls = new Hls();
		hls.loadSource(url);
		hls.attachMedia(videoRef);
		hls.on(Hls.Events.MANIFEST_PARSED, () => {
			videoRef.play();
		});
	} else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
		videoRef.src = url;
		videoRef.addEventListener('loadedmetadata', () => {
			videoRef.play();
		});
	} else {
		console.error('This device does not support HLS.');
	}
}

// Function to update the video source URL
export function updateVideoSource(videoRef, url, type = 'mp4') {
	const source = videoRef.querySelector('source');
	source.src = url;
	source.type = `video/${type}`;
	videoRef.load();
}

// Function to handle proxy checkbox change event
export function handleProxyCheckboxChange(event, videoRef) {
	const proxy = event.target.checked;
	proxyStore.set(proxy);
	const channel = get(selectedChannel);

	if (channel) {
		playHLSStream(channel.url, videoRef, get(proxyStore));
	}
}

// Function to handle transcode checkbox change event
export function handleTranscodeCheckboxChange(event, videoRef) {
	const transcode = event.target.checked;
	transcodeStore.set(transcode);
	if (transcode) {
		transcodeMedia(get(streamUrl), videoRef);
	}
}

// Function to fetch the M3U channels from the selected provider
export async function fetchChannels(provider) {
	isLoading.set(true);
	channels.set([]);
	try {
		const response = await fetch(`/api/m3u/${provider}`);
		const m3u8Text = await response.text();
		const channelList = parseM3U8(m3u8Text);
		channels.set(channelList);
	} catch (error) {
		console.error('Error fetching channels:', error);
	} finally {
		isLoading.set(false);
	}
}

// Function to parse M3U8 content and extract channels
export function parseM3U8(m3u8Text) {
	const lines = m3u8Text.split('\n');
	const channelList = [];
	let channel = {};

	lines.forEach((line) => {
		if (line.startsWith('#EXTINF')) {
			const name = line.split(',')[1]?.trim();
			const channelId = line.match(/tvg-id="([^"]*)"/)?.[1]?.trim();
			channel = { name, channelId };
		} else if (line.startsWith('http')) {
			channel.url = line.trim();
			channelList.push(channel);
		}
	});

	return channelList;
}

export async function selectChannelByProgram(program) {
	console.log('selectChannelByProgram:', program);
	await fetchChannels(program.providerId);
	const channel = get(channels).find((ch) => ch.channelId === program.channelId);
	console.log('found channel:', channel);

	isChannelListOpen.set(false);
	selectedChannel.set(channel);
	streamUrl.set(channel.url);
	const transcode = get(transcodeStore); // Assume there's a transcode store to track state
	if (transcode) {
		transcodeMedia(channel.url, document.getElementById('video'));
	} else {
		playHLSStream(channel.url, document.getElementById('video'), get(proxyStore)); // Assume proxyStore exists
	}
}
// Function to select a channel and play it
export function selectChannel(channel) {
	console.log('selectChannel:', channel);
	isChannelListOpen.set(false);
	selectedChannel.set(channel);
	streamUrl.set(channel.url);
	const transcode = get(transcodeStore); // Assume there's a transcode store to track state
	if (transcode) {
		transcodeMedia(channel.url, document.getElementById('video'));
	} else {
		playHLSStream(channel.url, document.getElementById('video'), get(proxyStore)); // Assume proxyStore exists
	}
}

// Function to fetch EPG data for the given M3U ID
export async function fetchEPG(m3uId) {
	try {
		const response = await fetch(`/api/m3u/${m3uId}/epg`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const xmlText = await response.text();
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

		const xmlChannels = xmlDoc.querySelectorAll('channel');
		const xmlPrograms = xmlDoc.querySelectorAll('programme');

		let channels = [];

		Array.from(xmlChannels).forEach((channel) => {
			const channelId = channel.getAttribute('id');
			const name = channel.querySelector('display-name').textContent;
			const icon = channel.querySelector('icon')?.getAttribute('src');
			const programs = [];

			channels.push({
				providerId: m3uId,
				channelId,
				name,
				icon,
				programs
			});
		});

		Array.from(xmlPrograms).forEach((program) => {
			const channelId = program.getAttribute('channel').trim();
			const channelIndex = channels.findIndex((channel) => channel.channelId === channelId);

			if (channelIndex > -1) {
				const title = program.querySelector('title').textContent;
				const start = new Date(formatTime(program.getAttribute('start')));
				const stop = new Date(formatTime(program.getAttribute('stop')));

				if (currentTime <= start && start <= endTime) {
					channels[channelIndex].programs.push({
						providerId: m3uId,
						channelId,
						title,
						start,
						stop
					});
				}
			}
		});

		channels = removeEmptyChannels(channels);
		channels = fillMissingTime(channels);

		setEPGData({ channels, timeBlocks: generateTimeBlocks() });
	} catch (err) {
		setEPGError(`Failed to fetch EPG data: ${err.message}`);
		console.error('Error fetching EPG data:', err);
	}
}

// Additional helper functions
export function formatTime(time) {
	return time.replace(
		/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}) ([+-]\d{2})(\d{2})/,
		'$1-$2-$3T$4:$5:$6$7:$8'
	);
}

export function generateTimeBlocks() {
	const blocks = [];
	const tempTime = new Date(currentTime);
	tempTime.setMinutes(0, 0, 0);

	while (tempTime <= endTime) {
		blocks.push(new Date(tempTime));
		tempTime.setHours(tempTime.getHours() + 1);
	}

	return blocks;
}

export function removeEmptyChannels(channels) {
	return channels.filter((channel) => channel.programs.length > 0);
}

export function fillMissingTime(channels) {
	channels.forEach((channel) => {
		const { channelId, providerId } = channel;
		const updatedPrograms = [];
		let previousStop = new Date(currentTime);
		previousStop.setSeconds(0, 0);

		let newEndTime = new Date(endTime);
		newEndTime.setHours(newEndTime.getHours() + 1);

		channel.programs.forEach((program) => {
			const programStart = new Date(program.start);
			const programStop = new Date(program.stop);
			programStart.setSeconds(0, 0);
			programStop.setSeconds(0, 0);

			if (previousStop < programStart) {
				updatedPrograms.push({
					channelId,
					providerId,
					title: 'empty',
					start: new Date(previousStop),
					stop: new Date(programStart),
					empty: true
				});
			}
			updatedPrograms.push({
				...program,
				channelId,
				providerId,
				start: programStart,
				stop: programStop
			});
			previousStop = programStop;
		});

		if (previousStop < newEndTime) {
			const end = new Date(newEndTime);
			end.setSeconds(0, 0);

			updatedPrograms.push({
				channelId,
				providerId,

				title: 'empty',
				start: previousStop,
				stop: end,
				empty: true
			});
		}

		channel.programs = updatedPrograms;
	});

	return channels;
}
