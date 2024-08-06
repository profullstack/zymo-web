import env from '@rcompat/env';
import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
    return {
        async createPost({ title, thumbnail, slug, authorName, markdown, excerpt, tags, userId }) {

            try {
                const createdAt = Date.now();
                const updatedAt = createdAt;

                const blogPost = await db.create("blogposts",
                    {
                        title, thumbnail, slug, authorName, markdown, excerpt, tags, userId, createdAt, updatedAt

                    });
                return blogPost.pop();

            } catch (e) {
                console.error(e)
            }

        },
        async getAllPosts() {

            try {
                const query = `SELECT * FROM blogposts ORDER BY updatedAt DESC`;

                const blogPosts = await db.query(query);

                return blogPosts.pop();
            } catch (e) {
                console.error(e);
            }
        },
        async getPostById(id) {
            try {
                const query = `SELECT * FROM blogposts WHERE id = $id`;
                const blogPost = await db.query(query, {
                    id
                });
                return blogPost.pop().pop();
            } catch (e) {
                console.error(e);
            }
        },
        async getPostBySlug(slug) {
            try {
                const query = `SELECT * FROM blogposts WHERE slug = $slug`;
                const blogPost = await db.query(query, {
                    slug
                });
                return blogPost.pop().pop();
            } catch (e) {
                console.error(e);
            }
        },
        async getPostsByTag(tag) {
            try {
                const query = `SELECT * FROM blogposts WHERE $tag in tags ORDER BY updatedAt DESC`;
                const blogPosts = await db.query(query, {
                    tag
                });
                return blogPosts.pop();
            } catch (e) {
                console.error(e);
            }
        },
        async deletePost(id) {
            try {
                const blogPost = await db.delete(id);
                return blogPost;
            } catch (e) {
                throw e;
                console.error(e)
            }
        },

        async updatePostViews(id) {
            try {
                const query = `UPDATE blogposts SET views += 1 WHERE id = $id`;

                const blogPost = await db.query(query, {
                    id
                });

                return blogPost.pop().pop();
            } catch (e) {
                console.error(e)
            }
        },
        async updatePost(id, data) {
            try {
                const blogPost = await db.merge(id, { ...data, updatedAt: Date.now() });
                return blogPost.pop();

            } catch (e) {
                console.error(e);
            }
        }
    }
}

export default {
    id: primary
};
