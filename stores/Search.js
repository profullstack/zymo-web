import primary from '@primate/types/primary';
import { getMe } from '../modules/user.js';

export const actions = ({ connection: db }) => {
	return {
		me: async (email) => {
			return await getMe(db, email);
		},

        async search(q) {
			console.log('search for:', q);
			try {
                // todo do massive search
                // 1. fetch all movies from db and epg
                // 2. fetch all podcasts from db
                // 3. fetch all series from db and epg
                // 4. fetch all live streams from epg
                // 5. fetch all music from db
                // 6. fetch all books from db
				return { movies: [], podcasts: [], series: [], liveStreams: [], music: [], books: [] };
            } catch (e) {
				console.error(e);
			}
		},
	};
};

export default {
	id: primary
};
