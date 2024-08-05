import view from 'primate/handler/view';
import redirect from 'primate/handler/redirect';

export default {
	async get(request) {
		const { path, store, session } = request;
		const { Blog } = store;
		const slug = path.get('slug');

		let post = await Blog.getPostBySlug(slug);

		if (post) {
			let isAdmin = false;
			post = await Blog.updatePostViews(post.id);
			try {
				isAdmin = session.get('user').isAdmin;
			} catch (e) {}
			return view('blog/ViewPost.svelte', { post, isAdmin });
		}

		return redirect('/blog');
	}
};
