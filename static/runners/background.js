// Auto-starting heartbeat background runner
console.log('🚀 Background runner script loaded at', new Date().toISOString());

// State stored in a way that might persist
let heartbeatCount = 0;
let isRunning = false;
let startTime = Date.now();

// Start heartbeat immediately when script loads
console.log('📈 Starting auto heartbeat...');
isRunning = true;

// Heartbeat function
function doHeartbeat() {
	heartbeatCount++;
	const now = Date.now();
	const uptime = Math.floor((now - startTime) / 1000);
	const timestamp = new Date().toISOString();
	
	console.log(`💓 Heartbeat #${heartbeatCount} at ${timestamp} (uptime: ${uptime}s)`);
	
	// Return current state - this will be the "status"
	return {
		heartbeatCount,
		isRunning,
		uptime,
		timestamp,
		startTime,
		message: `Background runner alive! Beat #${heartbeatCount}`,
		heartbeat: {
			count: heartbeatCount,
			timestamp,
			message: `Beat #${heartbeatCount}`
		}
	};
}

// Start the heartbeat immediately
const status = doHeartbeat();

// Set up interval for continuous heartbeat
const heartbeatInterval = setInterval(() => {
	doHeartbeat();
}, 3000);

console.log('🎆 Heartbeat started! Initial status:', status);

// Event listeners - these will run in new instances but heartbeat continues
addEventListener('getStatus', (resolve) => {
	console.log('📈 Status requested');
	// Return the current status (even if this is a new instance)
	const currentStatus = {
		heartbeatCount,
		isRunning: true, // Always running since we auto-start
		uptime: Math.floor((Date.now() - startTime) / 1000),
		timestamp: new Date().toISOString(),
		message: 'Heartbeat is running',
		heartbeat: {
			count: heartbeatCount,
			timestamp: new Date().toISOString(),
			message: `Heartbeat running (count may reset per instance)`
		}
	};
	console.log('📊 Current status:', currentStatus);
	resolve(currentStatus);
});

// Simple status event (backup)
addEventListener('status', (resolve) => {
	console.log('📈 Legacy status requested');
	resolve({
		heartbeatCount,
		isRunning: true,
		heartbeat: {
			count: heartbeatCount,
			timestamp: new Date().toISOString(),
			message: `Auto-running heartbeat`
		}
	});
});
