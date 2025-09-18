<script lang="ts">
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
	import {
		CapacitorBarcodeScanner,
		CapacitorBarcodeScannerTypeHint
	} from '@capacitor/barcode-scanner';

	let imageUrl: string | undefined;
	let qrCodeData: string | undefined;
	let scanError: string | undefined;

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
</script>

<div class="flex flex-col gap-2">
	<button class="btn btn-primary" onclick={takePicture}>Take Photo</button>

	{#if imageUrl}
		<div class="card">
			<h2>Photo</h2>
			<img src={imageUrl} alt="Taken with camera" />
		</div>
	{/if}

	<button class="btn btn-primary" onclick={scanQRCode}>Scan QR Code</button>

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
</div>

<style>
	img {
		max-width: 100%;
		height: auto;
	}
</style>
