import { createClient } from '@redis/client';
import { parseM3U8 } from './player.js';

const client = createClient();

client.on('error', (err) => {
	console.error('Redis error:', err);
});

const CACHE_EXPIRATION = 60 * 15; // in seconds

async function fetchById(db, id, filterValue = '') {
    if (!client.isOpen && !client.isConnecting) {
        await client.connect();
    }
        
    console.log('id:', id);
    const query = `SELECT * FROM m3u WHERE id = $id`;
    const [m3u] = await db.query(query, {
        id
    });

    console.log('id m3u:', m3u);

    const cacheKey = id + '/m3u';
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
        console.log('got cache: ', cacheKey);
        return cachedData;
    }

    try {
        // const res = await fetchChannels(id, filterValue);
        const res = await fetch(m3u.pop().url);

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
}

async function filterChannels(m3uText, filterValue) {
    if (!m3uText) return [];
    const channelList = parseM3U8(m3uText);

    return channelList.filter((ch) => {
        if (!filterValue) return ch;
        return ch.name.toLowerCase().indexOf(filterValue.toLowerCase()) > -1;
    });
}

async function fetchEPGById(db, provider) {
	if (!client.isOpen && !client.isConnecting) {
		await client.connect();
	}

    const { id } = provider;
	const query = `SELECT * FROM m3u WHERE id = $id`;
	const [m3u] = await db.query(query, {
		id
	});

	console.log('id m3u:', m3u);

	const cacheKey = `${id}/m3u/epg`;
	const cachedData = await client.get(cacheKey);

	if (cachedData) {
		console.log('got cache: ', cacheKey);
		return cachedData;
	}

	try {
		const res = await fetch(m3u.pop().epg);

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
}

async function getAllByUserId(db, createdBy) {
	const query = `SELECT * FROM m3u WHERE createdBy = $createdBy`;

	console.log(query, createdBy);
	try {
		const [m3us] = await db.query(query, {
			createdBy
		});

		console.log('all m3u:', m3us);

		return m3us;
	} catch (err) {
		console.error(err);
		throw err;
	}
}

export { fetchEPGById, getAllByUserId, fetchById, filterChannels };
