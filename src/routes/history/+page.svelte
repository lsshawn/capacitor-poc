<script lang="ts">
	import { onMount } from 'svelte';
	import { getTrips } from '$lib/services/storage';

	let trips = $state([]);

	onMount(async () => {
		trips = await getTrips();
	});
</script>

<h1>Trip History</h1>

{#if trips.length === 0}
	<p>No trips found.</p>
{:else}
	<div class="space-y-3">
		{#each trips as trip}
			<div class="card bg-base-100 shadow-sm border">
				<div class="card-body p-4">
					<div class="flex justify-between items-start">
						<div>
							<h3 class="card-title text-base">
								🚗 Trip #{trip.id}
							</h3>
							<p class="text-sm text-base-content/70">
								📅 {new Date(trip.startTime).toLocaleString()}
							</p>
							{#if trip.endTime}
								<p class="text-sm text-base-content/70">
									⏱️ {Math.round((new Date(trip.endTime) - new Date(trip.startTime)) / 60000)} minutes
								</p>
							{/if}
							{#if trip.distance}
								<p class="text-sm text-base-content/70">
									📏 {(trip.distance / 1000).toFixed(1)} km
								</p>
							{/if}
						</div>
						<a href={`/ride/${trip.id}`} class="btn btn-sm btn-primary">
							View Details
						</a>
					</div>
					{#if trip.path}
						<div class="text-xs text-base-content/50">
							📍 {trip.path.length} location points recorded
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
