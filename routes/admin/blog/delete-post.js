import view from "primate/handler/view";

export default {

  async post(request) {
    const { store, body } = request;
    const { postId } = body;
    const { Blog } = store;

    await Blog.deletePost(postId);

    return "";
  },
}