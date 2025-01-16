export default {
    async post(request) {
        const { body, store, session } = request;
        const { User } = store;


        // Validate preferences
        if (typeof body.emailNotifications !== 'boolean' ||
            !['instant', 'daily', 'weekly', 'never'].includes(body.emailDigestFrequency)) {
            return {
                status: 400,
                body: { error: 'Invalid preferences' }
            };
        }

        console.log('body:', body);

        try {
            // Update user preferences under settings
            await User.updateNotificationPreferences(
                session.get('user').id,
                body
            );

            return {
                status: 200,
                body: { success: true }
            };
        } catch (error) {
            console.error('Error updating preferences:', error);
            return {
                status: 500,
                body: { error: 'Failed to update preferences' }
            };
        }
    }
};
