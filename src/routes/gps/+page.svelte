<script lang="ts">
	import { onMount } from 'svelte';
	import { Capacitor } from '@capacitor/core';
	import { Geolocation, type Position } from '@capacitor/geolocation';
	import { PUBLIC_GOOGLE_PLACES_API } from '$env/static/public';

	let gmpMap: any;
	let gmpAdvancedMarker: any;
	let currentPosition: Position | null = null;
	let error: string | null = null;
	let isWatching: boolean = false;
	let watchId: string | null = null;

	const mapOptions = {
		center: { lat: 37.4221, lng: -122.0841 },
		fullscreenControl: true,
		mapTypeControl: false,
		streetViewControl: false,
		zoom: 15,
		zoomControl: true,
		maxZoom: 22,
		mapId: 'DEMO_MAP_ID'
	};

	async function initMap(position: Position) {
		const coords = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};
		mapOptions.center = coords;

		await customElements.whenDefined('gmp-map');
		gmpMap.innerMap.setOptions(mapOptions);
		gmpAdvancedMarker.position = coords;
	}

	onMount(async () => {
		// Import Google Maps library
		await import(
			'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js'
		);
		console.log('GPS page loaded with full Capacitor Geolocation support');
	});

	async function getCurrentLocation() {
		try {
			error = null;
			
			if (Capacitor.getPlatform() !== 'web') {
				const permissions = await Geolocation.checkPermissions();
				if (permissions.location !== 'granted') {
					const request = await Geolocation.requestPermissions();
					if (request.location !== 'granted') {
						error = 'Location permission not granted';
						return;
					}
				}
			}
			
			const position = await Geolocation.getCurrentPosition({
				enableHighAccuracy: true,
				timeout: 15000
			});
			
			currentPosition = position;
			if (gmpMap && gmpAdvancedMarker) {
				const coords = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				gmpMap.center = coords;
				gmpAdvancedMarker.position = coords;
			} else {
				await initMap(position);
			}
		} catch (e: any) {
			console.error('Error getting location:', e);
			error = e.message || 'Failed to get location';
		}
	}
	
	async function startWatching() {
		if (isWatching) return;
		
		try {
			error = null;
			isWatching = true;
			
			watchId = await Geolocation.watchPosition({
				enableHighAccuracy: true,
				timeout: 15000,
				maximumAge: 30000
			}, (position, err) => {
				if (err) {
					console.error('Watch position error:', err);
					error = err.message;
					return;
				}
				if (position) {
					currentPosition = position;
					const coords = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					if (gmpMap && gmpAdvancedMarker) {
						gmpMap.center = coords;
						gmpAdvancedMarker.position = coords;
					}
					console.log('Location updated:', coords);
				}
			});
		} catch (e: any) {
			console.error('Error starting watch:', e);
			error = e.message || 'Failed to start watching';
			isWatching = false;
		}
	}
	
	async function stopWatching() {
		if (!isWatching || !watchId) return;
		
		try {
			await Geolocation.clearWatch({ id: watchId });
			watchId = null;
			isWatching = false;
			console.log('Stopped watching location');
		} catch (e: any) {
			console.error('Error stopping watch:', e);
		}
	}
</script>

<div class="flex flex-col gap-2">
	<h1>GPS with Background Location Support</h1>

	<gmpx-api-loader key={PUBLIC_GOOGLE_PLACES_API}></gmpx-api-loader>

	<div class="card">
		<div class="controls">
			<button on:click={getCurrentLocation} class="btn btn-primary">Get Current Location</button>
			{#if !isWatching}
				<button on:click={startWatching} class="btn btn-success">Start Watching</button>
			{:else}
				<button on:click={stopWatching} class="btn btn-danger">Stop Watching</button>
			{/if}
		</div>
		
		<div class="status">
			{#if isWatching}
				<p class="status-active">🟢 Actively tracking location (background enabled)</p>
			{:else}
				<p class="status-inactive">⚪ Location tracking stopped</p>
			{/if}
		</div>
		
		{#if currentPosition}
			<div class="location-info">
				<p><strong>Latitude:</strong> {currentPosition.coords.latitude.toFixed(6)}</p>
				<p><strong>Longitude:</strong> {currentPosition.coords.longitude.toFixed(6)}</p>
				<p><strong>Accuracy:</strong> {currentPosition.coords.accuracy.toFixed(2)} meters</p>
				{#if currentPosition.coords.speed}
					<p><strong>Speed:</strong> {(currentPosition.coords.speed * 3.6).toFixed(2)} km/h</p>
				{/if}
				<p><strong>Timestamp:</strong> {new Date(currentPosition.timestamp).toLocaleTimeString()}</p>
			</div>
		{:else if error}
			<p class="error"><strong>Error:</strong> {error}</p>
		{:else}
			<p>Click "Get Current Location" or "Start Watching" to begin</p>
		{/if}
	</div>

	<div class="map-container">
		<gmp-map bind:this={gmpMap} class="h-full w-full">
			<gmp-advanced-marker bind:this={gmpAdvancedMarker}></gmp-advanced-marker>
		</gmp-map>
	</div>
</div>
<style>
	.card {
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 16px;
		margin: 16px 0;
	}
	.map-container {
		height: 500px;
		width: 100%;
	}
	.controls {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.btn {
		padding: 8px 16px;
		border-radius: 4px;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}
	.btn:hover {
		transform: translateY(-1px);
		opacity: 0.9;
	}
	.btn-primary { background-color: #007bff; }
	.btn-success { background-color: #28a745; }
	.btn-danger { background-color: #dc3545; }
	.status {
		margin: 12px 0;
		padding: 8px;
		border-radius: 4px;
		background-color: #f8f9fa;
	}
	.status-active {
		color: #28a745;
		font-weight: bold;
	}
	.status-inactive {
		color: #6c757d;
	}
	.location-info {
		margin-top: 16px;
		padding: 12px;
		border-left: 4px solid #007bff;
		background-color: #f1f3f4;
	}
	.location-info p {
		margin: 6px 0;
	}
	.error {
		color: #dc3545;
	}
</style>
