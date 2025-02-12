import view from 'primate/handler/view';
import fs from 'fs';
import path from 'path';

async function loadPosts(tag) {
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

	return posts
		.sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		})
		.filter((post) => {
			return post.tags.indexOf(tag) > -1;
		});
}

export default {
	async get(request) {
		const { env } = process;
		const { APP_NAME, APP_DESCRIPTION } = env;
		const { session, path, store } = request;
		const tag = path.get('tag');
		const posts = await loadPosts(tag);

		return view('posts/Index.svelte', { APP_NAME, APP_DESCRIPTION, posts, tag });
	}
};
