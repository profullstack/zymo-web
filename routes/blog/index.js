import view from "primate/handler/view";

export default {

  async get(request) {
    const { store } = request;
    const { Blog } = store;

    const posts = await Blog.getAllPosts();

    return view('blog/Index.svelte', { posts });
  },
}