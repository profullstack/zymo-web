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
    const { Blog, utils: { File } } = store;
    const { title, thumbnail, markdown, excerpt, tags } = body;

    const user = session.get("user");
    const slug = titleToSlug(title);
    const authorName = `${user.firstName} ${user.lastName}`;

    let thumbnailUrl = '';

    if (thumbnail) {
      try {
        const thumbnailInfo = await File.upload(thumbnail, true, user.id);
        thumbnailUrl = thumbnailInfo?.publicUrl;
      } catch (e) { }
    }

    const blogPost = await Blog.createPost({
      title,
      thumbnail: thumbnailUrl,
      slug,
      authorName,
      markdown,
      excerpt,
      tags: JSON.parse(tags),
      userId: user.id
    });

    return redirect(`/admin/blog/${blogPost.id}`);

  }
}