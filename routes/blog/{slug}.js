import { view, redirect } from 'primate';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getPostBySlug(slug) {
	try {
		const directoryPath = join(process.cwd(), 'static', '_posts');
		const filePath = join(directoryPath, `/${slug}.js`);
		console.log(filePath);
		const postModule = await import(filePath);
		return postModule.article;
	} catch (error) {
		console.error('Error loading post:', error);
		return null;
	}
}

export default {
	async get(request) {
		const { session, path, store } = request;
		const slug = path.get('slug');
		const post = await getPostBySlug(slug);
		const html = marked.parse(post.content);
		console.log(html);

		return view('blog/Show.svelte', { post, html });
	}
};
