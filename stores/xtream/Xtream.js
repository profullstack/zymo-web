import env from 'rcompat/env';
import primary from '@primate/types/primary';
import { createClient } from '@redis/client';
import { getMe } from '../../modules/user.js';

const client = createClient();

client.on('error', (err) => {
	console.error('Redis error:', err);
});

const CACHE_EXPIRATION = 60 * 15; // in seconds

export const actions = ({ connection: db }) => {
	return {
		me: async () => {
			return await getMe(db);
		},
		async getXtreamCredentials(providerId) {
			try {
				const result = await db.select('xtream_codes', providerId);
				if (result) {
					return result;
				} else {
					throw new Error(`No credentials found for provider ID: ${providerId}`);
				}
			} catch (error) {
				console.error('Error fetching credentials:', error);
				throw error;
			}
		},
		async create(data) {
			// const { User } = store;

			console.log('create:', data);
			let { url, name, username, password } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const result = await db.create('xtream_codes', {
					url,
					name,
					username,
					password,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('xtream: ', result);
				return result;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getByName(name) {
			console.log('name:', name);
			const query = `SELECT * FROM xtream_codes WHERE name = $name`;

			console.log(query);

			try {
				const [xtream] = await db.query(query, {
					name
				});

				console.log('name xtream:', xtream);
				return xtream.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async getById(id) {
			console.log('id:', id);
			const query = `SELECT * FROM xtream_codes WHERE id = $id`;

			console.log(query);
			try {
				const [xtream] = await db.query(query, {
					id
				});

				console.log('id xtream:', xtream);

				return xtream.pop();
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async fetchById(id, filterValue = '') {
			await client.connect();

			console.log('id:', id);
			const query = `SELECT * FROM xtream_codes WHERE id = $id`;
			const [xtream] = await db.query(query, {
				id
			});

			console.log('id xtream:', xtream);
			const { username, password, url } = xtream.pop();

			const cacheKey = id + '/xc';
			const cachedData = await client.get(cacheKey);

			if (cachedData) {
				console.log('got cache: ', cacheKey);
				return cachedData;
			}

			try {
				const xtreamUrl = `${url}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
				console.log(xtreamUrl);
				// const res = await fetchChannels(id, filterValue);
				const res = await fetch(xtreamUrl);

				if (res.ok) {
					const data = (await res.json()).map((ch) => {
						ch.url = `${url}/${username}/${password}/${ch.stream_id}`; // store stream url
						return ch;
					});
					console.log('set cache:', cacheKey);
					await client.set(cacheKey, JSON.stringify(data), {
						EX: CACHE_EXPIRATION
					});

					return data;
				}
			} catch (err) {
				console.error(err);
			}
		},
		async fetchEPGById(id) {
			await client.connect();

			console.log('id:', id);
			const query = `SELECT * FROM xtream_codes WHERE id = $id`;
			const [xtream] = await db.query(query, {
				id
			});

			console.log('id:', xtream);
			const { username, password, url } = xtream.pop();

			const cacheKey = `${id}/xc/epg`;
			const cachedData = await client.get(cacheKey);

			if (cachedData) {
				console.log('got cache: ', cacheKey);
				return cachedData;
			}

			try {
				const xtreamEpgUrl = `${url}/xmltv.php?username=${username}&password=${password}`;
				// const xtreamEpgUrl = `${url}/player_api.php?username=${username}&password=${password}&action=get_simple_data_table`;

				const res = await fetch(xtreamEpgUrl);

				if (res.ok) {
					const data = await res.text();
					console.log('set cache:', cacheKey);
					await client.set(cacheKey, data, {
						EX: CACHE_EXPIRATION
					});

					return data;
				}
			} catch (err) {
				console.error(err);
			}
		},
		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM xtream_codes WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const [results] = await db.query(query, {
					createdBy
				});

				console.log('all:', results);

				return results;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async update(id, data) {
			console.log('update:', data);

			data.updatedAt = new Date().toISOString();

			try {
				await db.update(id, data);
				const [xtream] = await db.select(id);

				console.log('xtream updated: ', xtream);
				return xtream;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},
		async delete(id) {
			console.log('delete:', id);

			try {
				const res = await db.delete(id);

				console.log('res: ', res);
				return res;
			} catch (err) {
				console.error(err);
				throw err;
			}
		}
	};
};

export default {
	id: primary
};
