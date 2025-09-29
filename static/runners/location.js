console.log('🌍 Location background runner loaded at', new Date().toISOString());

// Background runner context - limited APIs available
// Geolocation APIs are not available in iOS background runner context
// We'll use this runner primarily for task scheduling and coordination

let taskCount = 0;

// Event listener for location updates - signal back that location is needed
addEventListener('locationUpdate', (resolve, reject, args) => {
    console.log('📡 locationUpdate event received in background runner');
    taskCount++;
    
    try {
        // Background runner cannot access geolocation directly in iOS
        // Signal back to main thread that it should get and save location
        const response = {
            success: true,
            message: 'Background task triggered - main thread should get location',
            taskId: taskCount,
            timestamp: Date.now(),
            action: 'requestLocationFromMainThread'
        };
        
        console.log('✅ Background task signal sent:', response);
        resolve(response);
        
    } catch (error) {
        console.error('❌ Background task error:', {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            error: error
        });
        
        reject({
            success: false,
            error: error?.message || 'Background task failed',
            taskId: taskCount
        });
    }
});

// Heartbeat to keep runner active
addEventListener('heartbeat', (resolve, reject, args) => {
    console.log('💫 Background runner heartbeat at', new Date().toISOString());
    resolve({ 
        success: true, 
        timestamp: Date.now(),
        message: 'Background runner active'
    });
});

console.log('🔄 Location background runner initialized and listening for events');
console.log('ℹ️ Note: Using native geolocation API - location data will be sent to main thread for storage');
