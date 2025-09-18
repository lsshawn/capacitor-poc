<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Capacitor } from '@capacitor/core';
	import { Geolocation, type Position } from '@capacitor/geolocation';
	import { PUBLIC_GOOGLE_PLACES_API } from '$env/static/public';

	let gmpMap: any;
	let gmpAdvancedMarker: any;
	let currentPosition: Position | null = null;
	let watchId: string | null = null;
	let error: string | null = null;

	const mapOptions = {
		center: { lat: 37.4221, lng: -122.0841 }, // Default to Googleplex
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

		try {
			if (Capacitor.getPlatform() !== 'web') {
				// Check permissions only on native platforms
				const permissions = await Geolocation.checkPermissions();
				if (permissions.location !== 'granted') {
					const request = await Geolocation.requestPermissions();
					if (request.location !== 'granted') {
						error = 'Location permission not granted';
						return;
					}
				}
			}

			// Get current position
			const position = await Geolocation.getCurrentPosition();
			currentPosition = position;
			await initMap(position);

			// Watch for position changes
			watchId = await Geolocation.watchPosition({}, (position, err) => {
				if (err) {
					console.error('Error watching position', err);
					error = err.message;
					return;
				}
				if (position) {
					currentPosition = position;
					const coords = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					gmpMap.center = coords;
					gmpAdvancedMarker.position = coords;
				}
			});
		} catch (e: any) {
			console.error('Error with geolocation', e);
			error = e.message;
		}
	});

	onDestroy(() => {
		if (watchId) {
			Geolocation.clearWatch({ id: watchId });
		}
	});
</script>

<div class="flex flex-col gap-2">
	<h1>Capacitor GPS</h1>

	<gmpx-api-loader key={PUBLIC_GOOGLE_PLACES_API}></gmpx-api-loader>

	<div class="card">
		{#if currentPosition}
			<p>Latitude: {currentPosition.coords.latitude}</p>
			<p>Longitude: {currentPosition.coords.longitude}</p>
			<p>Accuracy: {currentPosition.coords.accuracy} meters</p>
		{:else if error}
			<p style="color: red;">Error: {error}</p>
		{:else}
			<p>Getting location...</p>
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
</style>
