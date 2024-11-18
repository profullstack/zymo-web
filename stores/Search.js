import primary from '@primate/types/primary';
import { getMe } from '../modules/user.js';
import { fetchEPGById, getAllByUserId, fetchById, filterChannels } from '../modules/m3u.js';
import { getAllByUserId as getAllMusicByUserId } from '../modules/music.js';
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

			const music = await getAllMusicByUserId(db, me.id, 'music');

			return music.filter(m => {
				const { album, artist, songname } = m.mediaInfo;

				return album.toLowerCase().includes(q.toLowerCase()) || artist.toLowerCase().includes(q.toLowerCase()) || songname.toLowerCase().includes(q.toLowerCase());
			});
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
		async search(q) {
			console.log('search for:', q);
			const liveStreams = [];
			const podcasts = await this.getPodcasts(q);
			const music = await this.getMusic(q);

			console.log('music:', music);

			try {
				// todo do massive search
				// 1. fetch all movies from db and epg
				// 2. fetch all podcasts from db
				// 3. fetch all series from db and epg
				// 4. fetch all live streams from epg
				// 5. fetch all music from db
				// 6. fetch all books from db
				const providers = await this.getProviders();

				// Fetch all m3u data in parallel
				const fetchPromises = providers.map(async (provider) => {
					const m3uText = await fetchById(db, provider.id, q);
					const channels = await filterChannels(m3uText, q);

					return {
						provider,
						channels,
					}
				});

				const m3uResults = await Promise.all(fetchPromises);

				// Collect results
				liveStreams.push(...m3uResults);

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
