import { view, redirect } from 'primate';

export default {
    async get(request) {
        const { path, store, session } = request;
        const { Blog } = store;

        const slug = path.get("slug");

        let post = await Blog.getPostBySlug(slug);

        if (!post) {
            return redirect("/blog");
        }

        post = await Blog.updatePostViews(post.id);

        return view("blog/ViewPost.svelte", { post });
    },
}