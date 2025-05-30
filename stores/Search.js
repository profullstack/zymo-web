import primary from '@primate/types/primary';
import { getMe } from '../modules/user.js';
import { fetchEPGById, getAllByUserId, fetchById, filterChannels } from '../modules/m3u.js';
import { getAllByUserId as getAllMusicByUserId, groupAndSortMusic } from '../modules/music.js';
import env from 'rcompat/env';

export const actions = ({ connection: db }) => {
	return {
		me: async (email) => {
			return await getMe(db, email);
		},

		async getPodcasts(q) {
			const { API_URL } = env;
			try {
				const res = await fetch(`${API_URL}/podcasts/search?q=${encodeURIComponent(q)}`);

				if (res.ok) {
					return await res.json();
				}
			} catch (e) {
				console.error(e);
			}
		},
		async getMusic(q) {
			const me = await this.me();
			if (!me) return [];

			let music = await getAllMusicByUserId(db, me.id, 'music');
			music = music.filter((m) => {
				const { album, artist, songname } = m.mediaInfo;

				return (
					album.toLowerCase().includes(q.toLowerCase()) ||
					artist.toLowerCase().includes(q.toLowerCase()) ||
					songname.toLowerCase().includes(q.toLowerCase())
				);
			});

			const grouped = groupAndSortMusic(music);

			return grouped;
		},
		async getProviders() {
			const me = await this.me();
			if (!me) return [];

			const providers = await getAllByUserId(db, me.id);

			console.log('providers:', providers);

			return providers;
		},
		async getPlayList(provider, filterValue = '') {
			const m3us = await fetchById(db, provider.id, filterValue);

			return m3us;
		},

		async getLiveStreams(q) {
			const me = await this.me();
			if (!me) return [];

			const providers = await this.getProviders();

			// Fetch all m3u data in parallel
			const fetchPromises = providers.map(async (provider) => {
				const m3uText = await fetchById(db, provider.id, q);
				const channels = await filterChannels(m3uText, q);

				return {
					provider,
					channels
				};
			});

			const m3uResults = await Promise.all(fetchPromises);
			const liveStreams = await getAllByUserId(db, me.id, 'liveStreams');

			// Collect results
			liveStreams.push(...m3uResults);


			return liveStreams;
		},
		async search(q, types = []) {
			console.log('search for:', q);
			let podcasts = [];
			let music = [];
			let liveStreams = [];

			try {
				// todo do massive search
				// 1. fetch all movies from db and epg
				// 2. fetch all podcasts from db
				// 3. fetch all series from db and epg
				// 4. fetch all live streams from epg
				// 5. fetch all music from db
				// 6. fetch all books from db
				if (types.includes('podcasts')) {
					podcasts = await this.getPodcasts(q);
				}

				if (types.includes('music')) {
					music = await this.getMusic(q);
				}
				
				if (types.includes('livestreams')) {
					liveStreams = await this.getLiveStreams(q);
				}

				return {
					movies: [],
					podcasts,
					series: [],
					liveStreams,
					music,
					books: []
				};
			} catch (e) {
				console.error(e);
			}
		}
	};
};

export default {
	id: primary
};
