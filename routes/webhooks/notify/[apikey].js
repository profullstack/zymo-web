export default {
    async post(request) {
        const { body, store, params } = request;
        const {
            apikeys: { ApiKey },
            Blog,
            User,
            external: { Mailgun }
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

        const { postId, customMessage } = body;
        if (!postId) {
            return {
                status: 400,
                body: { error: 'Post ID is required' }
            };
        }

        // Get the blog post
        const post = await Blog.findOne({ id: postId });
        if (!post) {
            return {
                status: 404,
                body: { error: 'Blog post not found' }
            };
        }

        // Get all users
        const users = await User.find();

        // Filter users based on notification preferences
        const eligibleUsers = users.filter(user => {
            const prefs = user?.notificationPreferences || {
                emailNotifications: true,
                emailDigestFrequency: 'instant'
            };
            return prefs.emailNotifications && prefs.emailDigestFrequency === 'instant';
        });

        // Send notifications to eligible users
        const emailPromises = eligibleUsers.map(user => {
            const html = `
                <h1>New Blog Post: ${post.title}</h1>
                <p>${customMessage || 'A new blog post has been published!'}</p>
                <p>${post.excerpt || post.content.substring(0, 150) + '...'}</p>
                <p><a href="${process.env.APP_DOMAIN}/blog/${post.slug}">Read more</a></p>
                <hr>
                <p><small>
                    You received this email because you're subscribed to blog notifications. 
                    <a href="${process.env.APP_DOMAIN}/dashboard/settings">Manage your preferences</a>
                </small></p>
            `;

            return Mailgun.send({
                to: user.email,
                subject: `New Post: ${post.title}`,
                html
            });
        });

        try {
            await Promise.all(emailPromises);
            return {
                status: 200,
                body: { success: true, notifiedUsers: eligibleUsers.length }
            };
        } catch (error) {
            console.error('Error sending notifications:', error);
            return {
                status: 500,
                body: { error: 'Failed to send notifications' }
            };
        }
    }
};
