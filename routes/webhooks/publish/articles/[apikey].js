export default {
    async post(request) {
        const { body, store, params } = request;
        const {
            apikeys: { ApiKey },
            Blog
        } = store;
        const { apikey } = params;

        // Validate API key
        const validKey = await ApiKey.findOne({ id: apikey });
        if (!validKey) {
            return {
                status: 401,
                body: { error: 'Invalid API key' }
            };
        }

        // Get the blog post details from the request
        const { title, content, excerpt, slug, tags } = body;

        if (!title || !content) {
            return {
                status: 400,
                body: { error: 'Title and content are required' }
            };
        }

        try {
            // Create the blog post
            const post = await Blog.create({
                title,
                content,
                excerpt: excerpt || content.substring(0, 150) + '...',
                slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                tags: tags || [],
                published: true,
                publishedAt: new Date()
            });

            return {
                status: 200,
                body: {
                    success: true,
                    post: {
                        id: post.id,
                        title: post.title,
                        slug: post.slug,
                        url: `/blog/${post.slug}`
                    }
                }
            };
        } catch (error) {
            console.error('Error publishing article:', error);
            return {
                status: 500,
                body: { error: 'Failed to publish article' }
            };
        }
    }
};
