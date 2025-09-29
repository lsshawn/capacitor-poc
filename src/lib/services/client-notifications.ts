import { goto } from '$app/navigation';

export const initialize = async () => {
    try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            const rideId = notification.notification.extra.rideId;
            if (rideId) {
                goto(`/ride/${rideId}`);
            }
        });
        console.log('✅ Notification listener registered');
    } catch (error) {
        console.error('❌ Failed to initialize notification listeners:', {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            error: error
        });
    }
};

export const scheduleRideRequestNotification = async () => {
    try {
        console.log('📱 Scheduling ride request notification...');
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        const rideId = `ride-${Date.now()}`;
        
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: '🚗 New Ride Request!',
                    body: 'A passenger needs a ride. Tap to view details.',
                    id: parseInt(rideId.replace('ride-', '')),
                    schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
                    sound: 'default',
                    attachments: [],
                    actionTypeId: '',
                    extra: {
                        rideId: rideId,
                        type: 'ride-request'
                    }
                }
            ]
        });
        
        console.log('✅ Ride request notification scheduled:', rideId);
        return { success: true, rideId };
        
    } catch (error) {
        console.error('❌ Failed to schedule ride request notification:', {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            error: error
        });
        return { success: false, error: error?.message || 'Failed to schedule notification' };
    }
};
