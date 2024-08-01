import { view, redirect } from 'primate';

export default {
    async get(request) {
        const { path, store, session } = request;
        const { Blog } = store;

        const id = path.get("id");

        const post = await Blog.getPostById(id);

        if (!post) {
            return redirect("/admin/blog");
        }

        return view("admin/blog/EditPost.svelte", { post });
    },

    async post(request) {
        const { path, store, body, session } = request;
        const { Blog } = store;

        const { title, thumbnail, markdown, html, excerpt, tags } = body;

        const id = path.get("id");
        const user = session.get("user");
        const authorName = `${user.firstName} ${user.lastName}`;


        const blogPost = await Blog.updatePost(id, {
            title,
            thumbnail,
            authorName,
            html,
            markdown,
            excerpt,
            tags,
            userId: user.id
        });

        return redirect(`/blog/${blogPost.slug}`);

    }
}