export default {
	async get(request) {
		const { path, store } = request;
		const {
			xtream: { Xtream }
		} = store;
		const id = path.get('id');
		const xtream = await Xtream.fetchById(id);
		console.log('id:', xtream);

		// Truncate response to 200MB for Android/FireStick compatibility
		const MAX_SIZE = 200 * 1024 * 1024; // 200MB in bytes
		const jsonString = JSON.stringify(xtream);
		const sizeInBytes = Buffer.byteLength(jsonString, 'utf8');
		
		if (sizeInBytes > MAX_SIZE) {
			console.log(`Playlist too large (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB), truncating to 200MB`);
			// Truncate the array to fit within 5MB
			const truncatedData = [];
			let currentSize = Buffer.byteLength('[]', 'utf8');
			
			for (const item of xtream) {
				const itemSize = Buffer.byteLength(JSON.stringify(item), 'utf8');
				if (currentSize + itemSize < MAX_SIZE) {
					truncatedData.push(item);
					currentSize += itemSize;
				} else {
					break;
				}
			}
			
			console.log(`Truncated from ${xtream.length} to ${truncatedData.length} channels`);
			return truncatedData;
		}

		return xtream;
	}
};
