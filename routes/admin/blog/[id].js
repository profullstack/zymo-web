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
        const { Blog, utils: { File } } = store;
        const { title, thumbnail, markdown, excerpt, tags } = body;

        const id = path.get("id");
        const user = session.get("user");
        const authorName = `${user.firstName} ${user.lastName}`;

        let thumbnailUrl = thumbnail;

        if (thumbnail && typeof (thumbnail) == 'object') {
            try {
                const thumbnailInfo = await File.upload(thumbnail, true, user.id);
                thumbnailUrl = thumbnailInfo?.publicUrl;
            } catch (e) { console.error(e) }
        }

        const blogPost = await Blog.updatePost(id, {
            title,
            thumbnail: thumbnailUrl,
            authorName,
            markdown,
            excerpt,
            tags: JSON.parse(tags),
            userId: user.id
        });

        return redirect(`/blog/${blogPost.slug}`);

    }
}