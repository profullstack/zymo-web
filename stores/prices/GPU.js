import env from 'runtime-compat/env';
import { primary } from '@primate/types';
import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

export const actions = ({ connection: db }) => {
	return {
		async search(body) {
			const url = `https://api.rainforestapi.com/request?api_key=AFE7ECC9F15F44EDB49BE6E9A203CC5F&type=search&amazon_domain=amazon.com&search_term=h100&language=en_US&currency=usd&associate_id=thimbos-20&output=json&category_id=284822`;
			const cachedData = await redisClient.get(url);

			if (cachedData != null) {
				console.log('Retrieved from cache');
				return JSON.parse(cachedData).search_results;
			}

			const res = await fetch(url);

			if (res.ok) {
				const data = await res.json();

				await redisClient.set(url, JSON.stringify(data), {
					EX: 3600
				});

				return data.search_results;
			}
		}
	};
};

export default {
	id: primary
};
