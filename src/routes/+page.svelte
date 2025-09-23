<script lang="ts">
	import { onMount } from 'svelte';
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
	import {
		CapacitorBarcodeScanner,
		CapacitorBarcodeScannerTypeHint
	} from '@capacitor/barcode-scanner';
	import { PushNotifications, type PushNotificationSchema } from '@capacitor/push-notifications';
	import { SplashScreen } from '@capacitor/splash-screen';

	let imageUrl: string | undefined;
	let qrCodeData: string | undefined;
	let scanError: string | undefined;
	let pushToken: string | undefined;
	let pushError: string | undefined;
	let receivedNotifications: PushNotificationSchema[] = [];

	onMount(async () => {
		// Hide splash screen once app is loaded
		await SplashScreen.hide();
		
		// Add listeners for push notifications
		PushNotifications.addListener('registration', (token) => {
			console.info('Registration token: ', token.value);
			pushToken = token.value;
		});

		PushNotifications.addListener('registrationError', (err) => {
			console.error('Registration error: ', err.error);
			pushError = err.error;
		});

		PushNotifications.addListener('pushNotificationReceived', (notification) => {
			console.log('Push notification received: ', notification);
			receivedNotifications = [...receivedNotifications, notification];
		});

		PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
			console.log(
				'Push notification action performed',
				notification.actionId,
				notification.inputValue
			);
			// Maybe navigate to a specific page
		});
	});

	async function takePicture() {
		try {
			const image = await Camera.getPhoto({
				quality: 90,
				allowEditing: false,
				resultType: CameraResultType.Uri,
				source: CameraSource.Camera
			});
			imageUrl = image.webPath;
		} catch (error) {
			console.error('Error taking picture', error);
		}
	}

	async function scanQRCode() {
		qrCodeData = undefined;
		scanError = undefined;
		try {
			const result = await CapacitorBarcodeScanner.scanBarcode({
				hint: CapacitorBarcodeScannerTypeHint.ALL
			});
			if (result.scanResult) {
				qrCodeData = result.scanResult;
			}
		} catch (error: any) {
			console.error(error);
			scanError = error.message;
		}
	}

	async function registerForPush() {
		pushToken = undefined;
		pushError = undefined;
		try {
			let permStatus = await PushNotifications.checkPermissions();

			if (permStatus.receive === 'prompt') {
				permStatus = await PushNotifications.requestPermissions();
			}

			if (permStatus.receive !== 'granted') {
				throw new Error('User denied permissions!');
			}

			await PushNotifications.register();
		} catch (e: any) {
			console.error(e);
			pushError = e.message;
		}
	}
</script>

<h1>Capacitor POC</h1>

<div class="card">
	<button on:click={takePicture}>Take Photo</button>
</div>

{#if imageUrl}
	<div class="card">
		<h2>Photo</h2>
		<img src={imageUrl} alt="Taken with camera" />
	</div>
{/if}

<div class="card">
	<button on:click={scanQRCode}>Scan QR Code</button>
</div>

{#if qrCodeData}
	<div class="card">
		<h2>QR Code Data</h2>
		<p>{qrCodeData}</p>
	</div>
{/if}

{#if scanError}
	<div class="card">
		<h2>Error Scanning</h2>
		<p style="color: red;">{scanError}</p>
	</div>
{/if}

<div class="card">
	<button on:click={registerForPush}>Register for Push Notifications</button>
</div>

{#if pushToken}
	<div class="card">
		<h2>Push Token</h2>
		<p style="word-break: break-all;">{pushToken}</p>
	</div>
{/if}

{#if pushError}
	<div class="card">
		<h2>Push Error</h2>
		<p style="color: red;">{pushError}</p>
	</div>
{/if}

{#if receivedNotifications.length > 0}
	<div class="card">
		<h2>Received Notifications</h2>
		{#each receivedNotifications as notification}
			<pre>{JSON.stringify(notification, null, 2)}</pre>
		{/each}
	</div>
{/if}

<style>
	.card {
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 16px;
		margin: 16px 0;
	}
	img {
		max-width: 100%;
		height: auto;
	}
</style>
