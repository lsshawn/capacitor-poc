import { BackgroundRunner } from '@capacitor/background-runner';
import { saveTrip } from './storage';
import { Preferences } from '@capacitor/preferences';

let locationInterval: NodeJS.Timeout | null = null;

export const startLocationTracking = async () => {
    try {
        console.log('🚗 Starting location tracking...');
        const newTrip = {
            id: new Date().getTime(),
            startTime: new Date(),
            endTime: null,
            distance: 0,
            path: []
        };
        
        await saveTrip(newTrip);
        console.log('✅ Trip saved:', newTrip.id);

        // Start background location updates with interval
        await startBackgroundLocationUpdates();
        
        console.log('✅ Background location tracking started');
        return { success: true, tripId: newTrip.id };
    } catch (error) {
        console.error('❌ Error starting location tracking:', {
            message: error?.message || 'Unknown error',
            name: error?.name || 'Unknown',
            stack: error?.stack,
            error: error
        });
        return { success: false, error: error?.message || 'Failed to start tracking' };
    }
};

const startBackgroundLocationUpdates = async () => {
    console.log('📡 Starting background location update interval...');
    
    // Clear any existing interval
    if (locationInterval) {
        clearInterval(locationInterval);
    }
    
    // Function to request location from background runner
    const requestLocationUpdate = async () => {
        try {
            console.log('📍 Requesting location update from background runner...');
            
            const result = await BackgroundRunner.dispatchEvent({
                label: 'com.example.background.location',
                event: 'locationUpdate',
                details: {}
            });
            
            console.log('📡 Background runner response:', result);
            
            // Background runner signals that main thread should get location
            if (result && result.success && result.action === 'requestLocationFromMainThread') {
                console.log('📍 Background runner requested location from main thread...');
                
                // Get current location using Capacitor Geolocation in main thread
                const { Geolocation } = await import('@capacitor/geolocation');
                
                try {
                    const position = await Geolocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 60000
                    });
                    
                    console.log('📍 Location obtained in main thread:', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: position.timestamp
                    });
                    
                    // Save location to current trip
                    await saveLocationToCurrentTrip({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: position.timestamp,
                        accuracy: position.coords.accuracy
                    });
                    
                } catch (geoError) {
                    console.error('❌ Main thread geolocation error:', geoError);
                }
                
            } else {
                console.warn('⚠️ Background runner response unexpected:', result);
            }
            
        } catch (error) {
            console.error('❌ Background location update error:', error);
        }
    };
    
    // Initial location update
    await requestLocationUpdate();
    
    // Set up interval for periodic updates (every 30 seconds)
    locationInterval = setInterval(requestLocationUpdate, 30000);
};

const saveLocationToCurrentTrip = async (locationData: {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
}) => {
    try {
        console.log('💾 Saving location to current trip...', locationData);
        
        // Get existing trips
        const { value } = await Preferences.get({ key: 'trips' });
        const trips = value ? JSON.parse(value) : [];
        const lastTrip = trips[trips.length - 1];
        
        // Add to current trip if exists and not ended
        if (lastTrip && !lastTrip.endTime) {
            const locationPoint = {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                timestamp: locationData.timestamp,
                accuracy: locationData.accuracy || 0
            };
            
            lastTrip.path.push(locationPoint);
            
            // Save updated trips
            await Preferences.set({ 
                key: 'trips', 
                value: JSON.stringify(trips) 
            });
            
            console.log(`✅ Location added to trip ${lastTrip.id}. Total points: ${lastTrip.path.length}`);
        } else {
            console.log('ℹ️ No active trip found, location not saved');
        }
        
    } catch (error) {
        console.error('❌ Error saving location to trip:', error);
    }
};

export const stopLocationTracking = async () => {
    console.log('Stopping location tracking...');
    try {
        // Clear the location update interval
        if (locationInterval) {
            clearInterval(locationInterval);
            locationInterval = null;
            console.log('✅ Location update interval cleared');
        }
        
        // Get current trips to finalize the last one
        const { value } = await Preferences.get({ key: 'trips' });
        const trips = value ? JSON.parse(value) : [];
        const lastTrip = trips[trips.length - 1];
        
        // Finalize the last trip if it exists and hasn't ended
        if (lastTrip && !lastTrip.endTime) {
            lastTrip.endTime = new Date();
            
            // Calculate basic distance if path exists
            if (lastTrip.path && lastTrip.path.length > 1) {
                // Simple distance calculation (could be improved with proper haversine formula)
                let totalDistance = 0;
                for (let i = 1; i < lastTrip.path.length; i++) {
                    const prev = lastTrip.path[i - 1];
                    const curr = lastTrip.path[i];
                    const deltaLat = curr.latitude - prev.latitude;
                    const deltaLng = curr.longitude - prev.longitude;
                    totalDistance += Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111000; // Rough km to meters
                }
                lastTrip.distance = Math.round(totalDistance); // meters
            }
            
            await Preferences.set({ key: 'trips', value: JSON.stringify(trips) });
            console.log('Trip finalized:', lastTrip);
        }
        
        // Send heartbeat to background runner to confirm it's still active
        try {
            await BackgroundRunner.dispatchEvent({
                label: 'com.example.background.location',
                event: 'heartbeat',
                details: {}
            });
            console.log('✅ Background runner heartbeat sent');
        } catch (error) {
            console.warn('⚠️ Background runner heartbeat failed (may be inactive):', error);
        }
        
        console.log('Location tracking stopped successfully');
    } catch (error) {
        console.error('Error stopping location tracking:', error);
    }
};
