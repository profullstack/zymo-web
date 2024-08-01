import { view, redirect } from 'primate';

export default {
    async get(request) {
        const { path, store, session } = request;
        const { Blog } = store;

        const tag = path.get("tag");

        let posts = await Blog.getPostsByTag(tag);

        return view("blog/Tag.svelte", { tag, posts });
    },
}