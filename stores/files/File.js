import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
	return {
		async getById(id) {
			try {
				const query = `SELECT * FROM media_files WHERE id = $id`;

				try {
					const [res] = await db.query(query, { id });

					return res.pop();
				} catch (e) {
					console.error(e);
					throw e;
				}
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async getAllByUserId(createdBy, type = null, videoType = null) {
			let where = '';

			if (type) {
				where = ` mediaInfo.type = $type AND `;
			}

			if (videoType) {
				where += ` mediaInfo.videoType = $videoType AND `;
			}

			const query = `SELECT * FROM media_files WHERE ${where} createdBy = $createdBy ORDER BY createdAt DESC LIMIT 10000`;

			console.log(query, type, videoType, createdBy);

			try {
				const data = {
					createdBy
				};

				if (type) {
					data.type = type;
				}

				if (videoType) {
					data.videoType = videoType;
				}

				const results = await db.query(query, data);

				console.log('all:', results);

				return results.pop();
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
