import { view } from 'primate';
import fs from 'fs';
import path from 'path';

async function loadPosts() {
	const directoryPath = path.join(process.cwd(), 'static', '_posts');
	console.log(directoryPath);
	const files = fs.readdirSync(directoryPath);
	const posts = [];

	for (const file of files) {
		if (file.endsWith('.js')) {
			// avoid crashing on corrupt module loads
			try {
				const filePath = path.join(directoryPath, file);
				const post = await import(`file://${filePath}`);
				posts.push(post.article);
			} catch (err) {
				console.error(err);
			}
		}
	}

	return posts.sort((a, b) => {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
}

export default {
	async get() {
		const { env } = process;
		const { APP_DOMAIN } = env;
		const posts = await loadPosts();

		console.log(APP_DOMAIN);

		return view('Sitemap.hbs', { posts, APP_DOMAIN });
	}
};
