export default {
    async post(request) {
        const { body, store, session } = request;
        const { User } = store;

        if (!session?.user?.id) {
            return {
                status: 401,
                body: { error: 'Unauthorized' }
            };
        }

        // Validate preferences
        if (typeof body.emailNotifications !== 'boolean' ||
            !['instant', 'daily', 'weekly', 'never'].includes(body.emailDigestFrequency)) {
            return {
                status: 400,
                body: { error: 'Invalid preferences' }
            };
        }

        try {
            // Update user preferences under settings
            await User.updateOne(
                { id: session.user.id },
                { 'settings.notificationPreferences': body }
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
