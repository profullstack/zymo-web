import { redirect, view } from "primate";

function titleToSlug(title) {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `${slug}-${Date.now()}`;

}

export default {

  async get(request) {
    return view('admin/blog/NewPost.svelte');
  },
  async post(request) {
    const { store, body, session } = request;
    const { Blog } = store;
    const { title, thumbnail, markdown, html, excerpt, tags } = body;

    const user = session.get("user");
    const slug = titleToSlug(title);
    const authorName = `${user.firstName} ${user.lastName}`;


    const blogPost = await Blog.createPost({
      title,
      thumbnail,
      slug,
      authorName,
      html,
      markdown,
      excerpt,
      tags,
      userId: user.id
    });

    return redirect(`/admin/blog/${blogPost.id}`);

  }
}