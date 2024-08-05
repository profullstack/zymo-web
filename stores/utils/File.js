import env from 'rcompat/env';
import { primary } from '@primate/types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const { UPLOADS_DIR } = process.env;

export const actions = ({ connection: db }) => {
    return {
        async upload(file, isPublic, userId) {
            try {

                if (!fs.existsSync(UPLOADS_DIR)) {
                    fs.mkdirSync(UPLOADS_DIR);
                }

                const uuid = uuidv4();
                const fileType = file.type
                const fileExtension = fileType.split('/').pop();
                const filePath = path.join(UPLOADS_DIR, `${uuid}.${fileExtension}`);
                const publicUrl = '/file/' + uuid;

                const buffer = Buffer.from(await file.arrayBuffer());
                fs.writeFile(filePath, buffer, () => { });

                const now = Date.now();

                const details = {
                    uuid,
                    type: fileType,
                    path: filePath,
                    extension: fileExtension,
                    isPublic,
                    publicUrl,
                    userId,
                    uploadedAt: now,
                };

                const [dbFile] = await db.create("files", details);

                return dbFile;
            } catch (e) {
                console.error(e);
                throw new Error('File upload failed.');
            }
        },
        async getByUUID(uuid) {
            try {
                const query = `SELECT * FROM files WHERE uuid = $uuid`;

                const [[file]] = await db.query(query, {
                    uuid
                });
                return file;
            } catch (e) {
                console.error(e);
            }
        }
    }
}

export default {
    id: primary
};
