import env from 'rcompat/env';
import primary from '@primate/types/primary';
import FormData from 'form-data';
import spawn from '@rcompat/stdio/spawn';
import { getMe } from '../../modules/user.js';
import xml2js from 'xml2js';

export const actions = ({ connection: db }) => {
	return {
		me: async () => {
			return await getMe(db);
		},
		async create(data) {
			console.log('create:', data);
			let { url, name, user, pass, provider, path } = data;
			const { DB_NS, DB_DB } = env;
			const me = await this.me();
			console.log('db:', DB_NS, DB_DB);

			try {
				const res = await db.create('podcast_shows', {
					url,
					createdBy: me.id,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});

				console.log('res: ', res);
				return res;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async getAllByUserId(createdBy) {
			const query = `SELECT * FROM podcast_shows WHERE createdBy = $createdBy`;

			console.log(query, createdBy);
			try {
				const [res] = await db.query(query, { createdBy });

				console.log('all:', res);

				return res;
			} catch (err) {
				console.error(err);
				throw err;
			}
		},

		async update(id, data) {
			console.log('update:', data);

			try {
				const res = await db.merge(id, {
					...data,
					updatedAt: new Date().toISOString()
				});

				console.log('updated: ', res);
				return res;
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
		},

		async search(q) {
			try {
				const command = './bin/podsearch';
				const args = `"${q}"`;
				const fullCommand = `${command} ${args}`;

				console.log(fullCommand);
				const { stdout } = spawn(fullCommand);

				return new Response(stdout, { headers: { 'context-type': 'application/json' } });
			} catch (err) {
				console.error(err);
				return new Response(err);
			}
		},

		async fetchFeed(url) {
			try {
				const res = await fetch(url);

				if (res.ok) {
					const xml = await res.text();

					const parser = new xml2js.Parser();

					const data = await parser.parseStringPromise(xml);
					console.log(data);

					return data;
				}
			} catch (err) {
				console.error(err);
			}
		}
	};
};

export default {
	id: primary
};
