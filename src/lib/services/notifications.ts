export const scheduleRideRequestNotification = async () => {
    try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'New Ride Request',
                    body: 'A new ride is available. Tap to view.',
                    id: 1,
                    extra: {
                        rideId: new Date().getTime()
                    }
                }
            ]
        });
        console.log('✅ Ride request notification scheduled');
    } catch (error) {
        console.error('❌ Failed to schedule notification:', {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            error: error
        });
        throw error;
    }
};
