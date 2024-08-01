import { view } from "primate";

export default {

  async get(request) {
    const { store } = request;
    const { Blog } = store;

    const posts = await Blog.getAllPosts();

    return view('admin/blog/Index.svelte', { posts });
  },
}