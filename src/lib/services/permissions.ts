// Dynamic imports for Capacitor plugins to avoid SSR issues

export const requestLocationPermissions = async () => {
    try {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        // First request basic location permission
        const permission = await Geolocation.checkPermissions();
        console.log('Current location permission:', permission);
        
        if (permission.location !== 'granted') {
            const requestResult = await Geolocation.requestPermissions();
            console.log('Location permission request result:', requestResult);
            
            if (requestResult.location !== 'granted') {
                throw new Error('Location permission denied');
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error requesting location permissions:', {
            message: error?.message || 'Unknown error',
            name: error?.name || 'Unknown',
            stack: error?.stack,
            error: error
        });
        return false;
    }
};

export const requestNotificationPermissions = async () => {
    try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        const permission = await LocalNotifications.checkPermissions();
        console.log('Current notification permission:', permission);
        
        if (permission.display !== 'granted') {
            const requestResult = await LocalNotifications.requestPermissions();
            console.log('Notification permission request result:', requestResult);
            
            if (requestResult.display !== 'granted') {
                throw new Error('Notification permission denied');
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', {
            message: error?.message || 'Unknown error',
            name: error?.name || 'Unknown',
            stack: error?.stack,
            error: error
        });
        return false;
    }
};

export const initializePermissions = async () => {
    console.log('Initializing permissions...');
    
    const locationGranted = await requestLocationPermissions();
    const notificationGranted = await requestNotificationPermissions();
    
    return {
        location: locationGranted,
        notifications: notificationGranted
    };
};