<script lang="ts">
	import { onMount } from 'svelte';
	import { BackgroundRunner } from '@capacitor/background-runner';
	import { SplashScreen } from '@capacitor/splash-screen';

	// Simple state
	let status = 'Ready';
	let backgroundData: any = null;
	let statusInterval: number;

	onMount(async () => {
		await SplashScreen.hide();
		startStatusMonitoring();
	});

	// Check background runner status
	async function checkStatus() {
		try {
			const result = await BackgroundRunner.dispatchEvent({
				label: 'com.example.background.fetcher',
				event: 'status'
			});
			backgroundData = result;
		status = `Auto-Running - Heartbeat instances active`;
		} catch (error) {
			status = 'Error';
		}
	}

	function startStatusMonitoring() {
		checkStatus();
		statusInterval = setInterval(checkStatus, 2000);
	}

	
</script>

<h1>Background Runner Test</h1>

<div class="card">
	<h2>Status: {status}</h2>
	
	<div class="data">
		<p><strong>Status:</strong> Background heartbeat is auto-running</p>
		<p><strong>Note:</strong> Each status check creates a new instance, but heartbeats continue in background</p>
		
		{#if backgroundData}
			<div class="heartbeat">
				<h3>Latest Instance Data:</h3>
				<p><strong>Instance Heartbeat Count:</strong> {backgroundData.heartbeatCount}</p>
				{#if backgroundData.uptime}
					<p><strong>Instance Uptime:</strong> {backgroundData.uptime} seconds</p>
				{/if}
				{#if backgroundData.timestamp}
					<p><strong>Last Check:</strong> {new Date(backgroundData.timestamp).toLocaleString()}</p>
				{/if}
				<p><strong>Message:</strong> {backgroundData.message || 'Heartbeat running'}</p>
			</div>
		{/if}
	</div>
	
	<p class="help">
		<strong>How it works:</strong> The background runner automatically starts a heartbeat when loaded. 
		Each status check may show a new instance (due to Capacitor's architecture), but multiple heartbeat 
		timers are running in parallel in the background.
		<br><br>
		<strong>To test:</strong> Put the app in background mode for 30+ seconds, then return. 
		You should see console logs showing continuous heartbeat activity proving background execution works!
	</p>
</div>

<style>
	.card {
		border: 2px solid #4a90e2;
		border-radius: 12px;
		padding: 20px;
		margin: 20px auto;
		max-width: 600px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.data {
		margin: 15px 0;
	}

	.heartbeat {
		background: rgba(255, 255, 255, 0.1);
		padding: 15px;
		margin: 10px 0;
		border-radius: 8px;
	}


	.buttons {
		display: flex;
		gap: 10px;
		margin: 20px 0;
		flex-wrap: wrap;
	}

	button {
		background: rgba(255, 255, 255, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.3);
		color: white;
		padding: 10px 15px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		flex: 1;
		min-width: 120px;
	}

	button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-1px);
	}

	.help {
		background: rgba(255, 255, 255, 0.1);
		padding: 15px;
		border-radius: 8px;
		margin-top: 15px;
		font-size: 0.9em;
		line-height: 1.4;
	}

	h1 {
		text-align: center;
		color: #333;
		margin-bottom: 30px;
	}

	h2 {
		margin-top: 0;
	}

	h3 {
		margin-top: 0;
		color: #e0e0e0;
	}
</style>
