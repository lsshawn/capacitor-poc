<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { startLocationTracking, stopLocationTracking } from '$lib/services/location';
	import { scheduleRideRequestNotification } from '$lib/services/client-notifications';
	import { Geolocation } from '@capacitor/geolocation';
	import { Preferences } from '@capacitor/preferences';

	let currentPosition = $state(null);
	let isTracking = $state(false);
	let watchId = null;
	let lastUpdate = $state(null);
	let accuracy = $state(null);
	let isStartingTrip = $state(false);
	let isStoppingTrip = $state(false);

	onMount(async () => {
		if (browser) {
			console.log('🗺️ Main page initializing...');
			
			try {
				console.log('Getting initial GPS position...');
				// Get initial position
				const position = await Geolocation.getCurrentPosition({
					enableHighAccuracy: true,
					timeout: 15000
				});
				currentPosition = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				};
				accuracy = position.coords.accuracy;
				lastUpdate = new Date();
				console.log('✅ Initial position obtained:', currentPosition);
			} catch (error) {
				console.error('❌ Error getting initial position:', {
					message: error?.message || 'Unknown GPS error',
					name: error?.name || 'LocationError',
					code: error?.code,
					stack: error?.stack,
					error: error
				});
				// Fallback to a default location (San Francisco)
				console.log('🌌 Using fallback location (San Francisco)');
				currentPosition = { latitude: 37.7749, longitude: -122.4194 };
				accuracy = null;
				lastUpdate = new Date();
			}
			console.log('✅ Main page initialization complete');
		} else {
			console.log('🚫 Not in browser environment, skipping GPS');
		}
	});

	const startTracking = async () => {
		if (isStartingTrip) return;
		isStartingTrip = true;
		
		try {
			const result = await startLocationTracking();
			if (result.success) {
				isTracking = true;
				
				// Start watching position for real-time updates
				if (browser && !watchId) {
					watchId = await Geolocation.watchPosition({
						enableHighAccuracy: true,
						timeout: 15000,
						maximumAge: 10000
					}, async (position) => {
						currentPosition = {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude
						};
						accuracy = position.coords.accuracy;
						lastUpdate = new Date();
						console.log('Position updated:', currentPosition);
						
						// Save position to current trip
						try {
							await saveCurrentPositionToTrip(position);
						} catch (saveError) {
							console.error('❌ Error saving position to trip:', saveError);
						}
					});
				}
			} else {
				console.error('Failed to start tracking:', result.error);
			}
		} catch (error) {
			console.error('Error in startTracking:', error);
		} finally {
			isStartingTrip = false;
		}
	};

	const stopTracking = async () => {
		if (isStoppingTrip) return;
		isStoppingTrip = true;
		
		try {
			await stopLocationTracking();
			isTracking = false;
			
			// Stop watching position
			if (watchId) {
				await Geolocation.clearWatch({ id: watchId });
				watchId = null;
			}
		} catch (error) {
			console.error('Error in stopTracking:', error);
		} finally {
			isStoppingTrip = false;
		}
	};

	const handleRideRequest = async () => {
		try {
			await scheduleRideRequestNotification();
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	
	const saveCurrentPositionToTrip = async (position) => {
		try {
			console.log('💾 Saving current position to active trip...');
			
			// Get existing trips
			const { value } = await Preferences.get({ key: 'trips' });
			const trips = value ? JSON.parse(value) : [];
			const lastTrip = trips[trips.length - 1];
			
			// Add to current trip if exists and not ended
			if (lastTrip && !lastTrip.endTime) {
				const locationPoint = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					timestamp: position.timestamp || Date.now(),
					accuracy: position.coords.accuracy || 0
				};
				
				lastTrip.path.push(locationPoint);
				
				// Save updated trips
				await Preferences.set({ 
					key: 'trips', 
					value: JSON.stringify(trips) 
				});
				
				console.log(`✅ Position saved to trip ${lastTrip.id}. Total points: ${lastTrip.path.length}`);
			} else {
				console.log('ℹ️ No active trip found, position not saved');
			}
			
		} catch (error) {
			console.error('❌ Error saving position to trip:', {
				message: error?.message || 'Unknown error',
				stack: error?.stack,
				error: error
			});
		}
	};
</script>

<!-- Header Section -->
<div class="text-center mb-6">
	<h1 class="text-3xl font-bold mb-2">🚗 Driver App</h1>
	<div class="flex justify-center">
		{#if isTracking}
			<div class="badge badge-success gap-2">
				<div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
				Tracking Active
			</div>
		{:else}
			<div class="badge badge-outline">
				Ready
			</div>
		{/if}
	</div>
</div>

<!-- Location Display -->
{#if currentPosition}
	<div class="card bg-primary text-primary-content shadow-lg mb-6">
		<div class="card-body text-center">
			<div class="text-4xl mb-2">📍</div>
			<h2 class="card-title justify-center">Current Location</h2>
			<div class="text-lg font-mono">
				{currentPosition.latitude.toFixed(4)}, {currentPosition.longitude.toFixed(4)}
			</div>
			{#if accuracy}
				<div class="text-sm opacity-70">
					Accuracy: ±{Math.round(accuracy)}m
				</div>
			{/if}
			{#if lastUpdate}
				<div class="text-xs opacity-60 mt-2">
					Last updated: {lastUpdate.toLocaleTimeString()}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="card bg-base-200 shadow-lg mb-6">
		<div class="card-body text-center py-12">
			<span class="loading loading-spinner loading-lg mb-4"></span>
			<p>Getting your location...</p>
		</div>
	</div>
{/if}

<!-- Main Actions -->
<div class="space-y-4">
	<!-- Primary Action Button -->
	{#if !isTracking}
		<button 
			class="btn btn-success btn-lg w-full h-16 text-xl" 
			onclick={startTracking}
			disabled={isStartingTrip}
		>
			{#if isStartingTrip}
				<span class="loading loading-spinner"></span>
				Starting...
			{:else}
				🚗 Start Driving
			{/if}
		</button>
	{:else}
		<button 
			class="btn btn-error btn-lg w-full h-16 text-xl" 
			onclick={stopTracking}
			disabled={isStoppingTrip}
		>
			{#if isStoppingTrip}
				<span class="loading loading-spinner"></span>
				Stopping...
			{:else}
				⏹️ Stop Driving
			{/if}
		</button>
	{/if}

	<!-- Secondary Action -->
	<button class="btn btn-outline w-full" onclick={handleRideRequest}>
		📱 Simulate Ride Request
	</button>
</div>
