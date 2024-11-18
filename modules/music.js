
async function getAllByUserId(db,createdBy, type = null, videoType = null) {
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


export { getAllByUserId };