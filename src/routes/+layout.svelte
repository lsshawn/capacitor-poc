<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	const menus = [
		{
			label: 'Map',
			icon: '🗺',
			href: '/'
		},
		{
			label: 'History',
			icon: '📋',
			href: '/history'
		}
	];

	onMount(async () => {
		if (browser) {
			// Add global error handlers
			window.addEventListener('error', (event) => {
				console.error('Global error caught:', {
					message: event.error?.message || event.message || 'Unknown error',
					filename: event.filename,
					lineno: event.lineno,
					colno: event.colno,
					stack: event.error?.stack,
					error: event.error
				});
			});

			window.addEventListener('unhandledrejection', (event) => {
				console.error('Unhandled promise rejection:', {
					reason: event.reason,
					message: event.reason?.message || 'Promise rejected',
					stack: event.reason?.stack,
					promise: event.promise
				});
			});

			console.log('🚀 App initialization starting...');
			
			try {
				// Initialize notifications listener
				console.log('1. Initializing notification listeners...');
				const { initialize } = await import('$lib/services/client-notifications');
				await initialize();
				console.log('✅ Notification listeners initialized');
				
				// Request permissions
				console.log('2. Requesting permissions...');
				const { initializePermissions } = await import('$lib/services/permissions');
				const permissions = await initializePermissions();
				console.log('✅ Permissions initialized:', permissions);
				
				console.log('🎉 App initialization complete!');
			} catch (error) {
				console.error('❌ App initialization failed:', {
					message: error?.message || 'Unknown error',
					name: error?.name || 'Unknown',
					stack: error?.stack,
					error: error
				});
			}
		}
	});

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex flex-col min-h-screen ios-safe-layout">
	<!-- Main Content -->
	<main class="flex-1 container mx-auto p-4 content-with-bottom-nav">
		<slot />
	</main>
	
	<!-- Bottom Navigation -->
	<nav class="bottom-nav-safe">
		<div class="flex justify-around items-center px-4">
			{#each menus as menu}
				<button 
					class="flex flex-col items-center justify-center gap-1 px-6 py-3 min-h-[60px] transition-colors rounded-lg
						{menu.href === $page.url.pathname 
							? 'text-blue-600 bg-blue-50' 
							: 'text-gray-600 hover:bg-gray-50'}"
					onclick={() => goto(menu.href)}
				>
					<span class="text-2xl leading-none emoji-icon">{menu.icon}</span>
					<span class="text-xs font-medium">{menu.label}</span>
				</button>
			{/each}
		</div>
	</nav>
</div>
