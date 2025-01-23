import view from 'primate/handler/view';

export default {
    async get(request) {
        const { store, path } = request;
        const { Unsubscribe } = store;
        let token = path.get('token');
        
        try {
            console.log('Looking up token:', token);
            const delivery = await Unsubscribe.findDeliveryByToken(token);
            console.log('Found delivery:', delivery);
            
            if (!delivery || !delivery.user_id) {
                console.log('Invalid delivery:', { delivery });
                return view('unsubscribe/Status.hbs', {
                    title: 'Invalid Unsubscribe Link',
                    message: 'This unsubscribe link appears to be invalid or has expired.',
                    success: false
                }, { partial: true });
            }

            await Unsubscribe.updateUserPreference(delivery.user_id);
            console.log('Updated preferences for user:', delivery.user_id);

            return view('unsubscribe/Status.hbs', {
                title: 'Successfully Unsubscribed',
                message: 'You have been unsubscribed from product updates and announcements.',
                success: true
            }, { partial: true });

        } catch (error) {
            console.error('Unsubscribe error:', error);
            return view('unsubscribe/Status.hbs', {
                title: 'Error',
                message: 'An error occurred while processing your unsubscribe request. Please try again later.',
                success: false
            }, { partial: true });
        }
    }
};