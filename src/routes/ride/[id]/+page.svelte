<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getTrips } from '$lib/services/storage';

	const rideId = $page.params.id;
	let trip = $state(null);

	onMount(async () => {
		const trips = await getTrips();
		trip = trips.find(t => t.id == rideId);
	});

</script>

<div class="max-w-4xl mx-auto">
	<div class="flex items-center gap-3 mb-6">
		<a href="/history" class="btn btn-ghost btn-sm">
			← Back to History
		</a>
		<h1 class="text-2xl font-bold">🚗 Trip Details</h1>
	</div>

	{#if trip}
		<!-- Trip Info Card -->
		<div class="card bg-base-100 shadow-lg mb-6">
			<div class="card-body">
				<div class="flex justify-between items-start mb-4">
					<div>
						<h2 class="card-title">Trip #{trip.id}</h2>
						<p class="text-base-content/70">
							📅 {new Date(trip.startTime).toLocaleString()}
						</p>
					</div>
					{#if trip.endTime}
						<div class="badge badge-success">Completed</div>
					{:else}
						<div class="badge badge-warning">In Progress</div>
					{/if}
				</div>

				<!-- Trip Stats -->
				<div class="stats stats-horizontal shadow-sm mb-4">
					<div class="stat">
						<div class="stat-title text-xs">Duration</div>
						<div class="stat-value text-sm">
							{#if trip.endTime}
								{Math.round((new Date(trip.endTime) - new Date(trip.startTime)) / 60000)} min
							{:else}
								Ongoing
							{/if}
						</div>
					</div>
					<div class="stat">
						<div class="stat-title text-xs">Distance</div>
						<div class="stat-value text-sm">
							{#if trip.distance}
								{(trip.distance / 1000).toFixed(1)} km
							{:else}
								N/A
							{/if}
						</div>
					</div>
					<div class="stat">
						<div class="stat-title text-xs">Points</div>
						<div class="stat-value text-sm">
							{trip.path ? trip.path.length : 0}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Map/Path Visualization -->
		{#if trip.path && trip.path.length > 0}
			<div class="card bg-base-100 shadow-lg mb-6">
				<div class="card-body">
					<h3 class="card-title mb-4">📍 Route Map</h3>
					
					<!-- Map Placeholder -->
					<div class="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 text-center relative overflow-hidden" style="height: 400px;">
						<div class="relative z-10 flex flex-col items-center justify-center h-full">
							<div class="text-6xl mb-4">🛣️</div>
							<h3 class="text-lg font-semibold text-gray-700 mb-2">Route Visualization</h3>
							<p class="text-sm text-gray-500 mb-4">Interactive map with path will be here</p>
							
							<div class="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
								<div class="text-sm font-medium text-gray-700 mb-2">
									📍 {trip.path.length} GPS points recorded
								</div>
								<div class="text-xs text-gray-500">
									Start: {trip.path[0].latitude.toFixed(4)}, {trip.path[0].longitude.toFixed(4)}
								</div>
								{#if trip.path.length > 1}
									<div class="text-xs text-gray-500">
										End: {trip.path[trip.path.length - 1].latitude.toFixed(4)}, {trip.path[trip.path.length - 1].longitude.toFixed(4)}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Path Points List -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title mb-4">📋 Location Points</h3>
					<div class="max-h-60 overflow-y-auto">
						{#each trip.path as point, i}
							<div class="flex justify-between items-center py-2 {i !== trip.path.length - 1 ? 'border-b border-base-200' : ''}">
								<div class="text-sm">
									<span class="font-mono text-xs">
										{point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
									</span>
									{#if point.accuracy}
										<span class="text-xs text-base-content/50 ml-2">±{Math.round(point.accuracy)}m</span>
									{/if}
								</div>
								<div class="text-xs text-base-content/50">
									{#if point.timestamp}
										{new Date(point.timestamp).toLocaleTimeString()}
									{:else}
										Point {i + 1}
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body text-center py-16">
					<div class="text-4xl mb-4">📍</div>
					<h3 class="text-lg font-semibold mb-2">No Location Data</h3>
					<p class="text-base-content/60">This trip has no recorded GPS points.</p>
				</div>
			</div>
		{/if}

	{:else}
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body text-center py-16">
				<div class="text-4xl mb-4">❓</div>
				<h3 class="text-lg font-semibold mb-2">Trip Not Found</h3>
				<p class="text-base-content/60 mb-4">The requested trip could not be found.</p>
				<a href="/history" class="btn btn-primary">Back to History</a>
			</div>
		</div>
	{/if}
</div>
