import primary from '@primate/types/primary';

export const actions = ({ connection: db }) => {
    return {
        async findDeliveryByToken(token) {
            console.log('Searching for delivery with token:', token);
            const query = 'SELECT * FROM email_delivery WHERE unsubscribe_token = $unsub_token';
            console.log('Query:', query);
            console.log('Query params:', { unsub_token: token });
            
            try {
                const result = await db.query(query, { unsub_token: token });
                console.log('Raw query result:', result);
                
                const [[delivery]] = result;
                console.log('Found delivery:', delivery);
                
                if (!delivery) {
                    console.log('No delivery found for token');
                } else if (!delivery.user_id) {
                    console.log('Delivery found but no user_id present');
                }
                
                return delivery;
            } catch (error) {
                console.error('Error querying delivery:', error);
                throw error;
            }
        },

        async updateUserPreference(userId) {
            console.log('Updating preferences for user:', userId);
            const query = 'UPDATE user SET settings.notificationPreferences.productUpdatesEmail = false WHERE id = $id';
            console.log('Query:', query);
            console.log('Query params:', { id: userId });
            
            try {
                await db.query(query, { id: userId });
                console.log('Successfully updated user preferences');
            } catch (error) {
                console.error('Error updating user preferences:', error);
                throw error;
            }
        }
    };
};

export default {
    id: primary
};