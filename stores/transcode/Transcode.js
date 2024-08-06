import primary from '@primate/types/primary';
import file from '@rcompat/fs/file';
import { mp4 } from '@rcompat/http/mime';
import spawn from '@rcompat/stdio/spawn';

const supportedExtensions = ['.mp4', '.mkv', '.mov'];

export const actions = ({ connection: db }) => {
	return {
		async me() {
			const me = await db.info();
			delete me?.password;
			console.log('me: ', me);

			return me;
		},

		async start(url, user = null, pass = null) {
			console.log('Transcoding:', url);
			const headers = {};

			try {
				if (user && pass) {
					const encodedCredentials = Buffer.from(`${user}:${pass}`).toString('base64');
					headers['Authorization'] = `Basic ${encodedCredentials}`;
				}

				// Fetch the video from the URL
				const response = await fetch(url, { headers, redirect: 'follow' });

				if (!response.ok) {
					throw new Error(`Failed to fetch video: ${response.statusText}`);
				}

				const videoStream = response.body;

				// const reader = response.body.getReader();
				// const videoStream = new ReadableStream(response.body.getReader);

				// Ensure videoStream is a valid readable stream
				if (!videoStream) {
					throw new Error('Failed to get video stream from response');
				}

				const command = 'ffmpeg';
				const input = '-i pipe:0';
				const flags =
					'-threads 4 -acodec aac -vcodec libx264 -movflags frag_keyframe+empty_moov -maxrate 2M -bufsize 1M';
				const output = '-f mp4 pipe:1';
				const fullCommand = `${command} ${input} ${flags} ${output}`;

				console.log(fullCommand);
				const { stdout, stdin } = spawn(fullCommand);

				videoStream.pipeTo(stdin).catch(() => {
					console.log('Cancelling stream');
					videoStream.cancel();
				});

				return new Response(stdout, { headers: { 'context-type': mp4 } });
			} catch (err) {
				throw err;
			}
		}
	};
};

export default {
	id: primary
};
