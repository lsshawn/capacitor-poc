<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const menus = [
		{
			label: 'Camera',
			icon: 'mdi:camera',
			href: '/camera'
		},
		{
			label: 'GPS',
			icon: 'ic:outline-map',
			href: '/gps'
		},
		{
			label: 'Scanner',
			icon: 'mdi:qrcode-scan',
			href: '/scanner'
		}
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container p-4">
	{@render children?.()}
</div>

<div class="dock">
	{#each menus as menu}
		<button class:dock-active={menu.href === page.url.pathname} onclick={() => goto(menu.href)}>
			<Icon icon={menu.icon} />
			<span class="dock-label">{menu.label}</span>
		</button>
	{/each}
</div>
