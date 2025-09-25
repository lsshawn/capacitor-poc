<script lang="ts">
	import { onMount } from 'svelte';
	// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
	import { Capacitor } from '@capacitor/core';

	let scanResult = '';
	let isScanning = false;
	let scanHistory: string[] = [];

	onMount(async () => {
		if (Capacitor.isNativePlatform()) {
			// Check permissions for barcode scanner
			try {
				// const status = await BarcodeScanner.checkPermission({ force: false });
				// if (status.granted) {
					console.log('Camera permission already granted');
				// } else {
					// console.log('Camera permission not granted yet');
				// }
			} catch (error) {
				console.log('Error checking permission:', error);
			}
		}
	});

	async function startScan() {
		try {
			isScanning = true;
			scanResult = '';

		if (Capacitor.isNativePlatform()) {
				// Check and request permission
				// const status = await BarcodeScanner.checkPermission({ force: true });
				// if (!status.granted) {
					// alert('Camera permission is required for barcode scanning');
					// isScanning = false;
					// return;
				// }

				// Start scanning
				// await BarcodeScanner.hideBackground();
				// const result = await BarcodeScanner.startScan();
				
				// if (result.hasContent) {
					// scanResult = result.content;
					// scanHistory = [scanResult, ...scanHistory.slice(0, 9)]; // Keep last 10 scans
					// await BarcodeScanner.showBackground();
					// await BarcodeScanner.stopScan();
				// }
				
				// Temporary fallback while BarcodeScanner is disabled
				scanResult = 'NATIVE_SIMULATION_' + Date.now();
				scanHistory = [scanResult, ...scanHistory.slice(0, 9)];
			} else {
				// Web fallback - simulate scan
				scanResult = 'WEB_SIMULATION_' + Date.now();
				scanHistory = [scanResult, ...scanHistory.slice(0, 9)];
			}
		} catch (error) {
			console.error('Scan error:', error);
			alert('Scan failed: ' + error);
		} finally {
			isScanning = false;
		}
	}

	function clearHistory() {
		scanHistory = [];
	}
</script>

<div class="scanner-container">
	<h1>Barcode/QR Scanner</h1>
	
	<div class="scan-section">
		<button 
			on:click={startScan} 
			disabled={isScanning}
			class="scan-button"
		>
			{isScanning ? 'Scanning...' : 'Start Scan'}
		</button>
	</div>

	{#if scanResult}
		<div class="result-section">
			<h3>Latest Scan Result:</h3>
			<div class="result">{scanResult}</div>
		</div>
	{/if}

	{#if scanHistory.length > 0}
		<div class="history-section">
			<div class="history-header">
				<h3>Scan History</h3>
				<button on:click={clearHistory} class="clear-button">Clear</button>
			</div>
			<ul class="history-list">
				{#each scanHistory as scan, index}
					<li class="history-item">{scan}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="info-section">
		<p><strong>Platform:</strong> {Capacitor.getPlatform()}</p>
		<p><strong>Status:</strong> {isScanning ? 'Scanning' : 'Ready'}</p>
	</div>
</div>

<style>
	.scanner-container {
		padding: 20px;
		max-width: 600px;
		margin: 0 auto;
	}

	h1 {
		text-align: center;
		margin-bottom: 30px;
		color: var(--color-text);
	}

	.scan-section {
		text-align: center;
		margin-bottom: 30px;
	}

	.scan-button {
		background: var(--color-theme-1);
		color: white;
		border: none;
		padding: 15px 30px;
		border-radius: 8px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.scan-button:hover:not(:disabled) {
		background: var(--color-theme-2);
	}

	.scan-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.result-section {
		background: #f0f9ff;
		border: 2px solid var(--color-theme-1);
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.result {
		font-family: monospace;
		background: white;
		padding: 10px;
		border-radius: 4px;
		border: 1px solid #ddd;
		word-break: break-all;
		font-size: 14px;
	}

	.history-section {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	.clear-button {
		background: #dc3545;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
	}

	.clear-button:hover {
		background: #c82333;
	}

	.history-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.history-item {
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 10px;
		margin-bottom: 8px;
		font-family: monospace;
		font-size: 14px;
		word-break: break-all;
	}

	.info-section {
		background: #e9ecef;
		border-radius: 8px;
		padding: 15px;
		font-size: 14px;
	}

	.info-section p {
		margin: 5px 0;
	}

	h3 {
		margin: 0 0 15px 0;
		color: var(--color-text);
	}
</style>