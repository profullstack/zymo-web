import file from '@rcompat/fs/file';

export default {
	async get(request) {
		const { path, store, session } = request;
		const {
			utils: { File }
		} = store;
		const uuid = path.get('uuid');

		const fileInfo = await File.getByUUID(uuid);

		if (fileInfo) {
			const datafile = file(fileInfo.path);
			if (await datafile.exists()) {
				if (fileInfo.isPublic || fileInfo.userId === session.get('user')?.id) {
					return new Response(datafile.stream(), {
						status: 200,
						headers: {
							'Content-Type': fileInfo.type
						}
					});
				}
			}
		}

		return new Response(null, { status: 404 });
	}
};
