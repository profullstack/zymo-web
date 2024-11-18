
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

function groupAndSortMusic(music) {
    const grouped = {};

    for (const file of music) {
        const { mediaInfo, musicbrainz } = file;
        const { url, user, pass, id } = file;
        const { artist, album, songname } = mediaInfo;

        if (!grouped[artist]) {
            grouped[artist] = {};
        }
        if (!grouped[artist][album]) {
            grouped[artist][album] = [];
        }
        grouped[artist][album].push({
            songname,
            url,
            user,
            pass,
            id,
            playing: false,
            artist,
            album,
            musicbrainz
        });
    }

    const sortedGrouped = {};
    const sortedArtists = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    for (const artist of sortedArtists) {
        sortedGrouped[artist] = {};
        const sortedAlbums = Object.keys(grouped[artist]).sort((a, b) => a.localeCompare(b));

        for (const album of sortedAlbums) {
            sortedGrouped[artist][album] = grouped[artist][album].sort((a, b) =>
                a.songname.localeCompare(b.songname)
            );
        }
    }

    return sortedGrouped;
}


export { getAllByUserId, groupAndSortMusic };