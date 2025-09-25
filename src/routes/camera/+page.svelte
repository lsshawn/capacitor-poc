<script lang="ts">
	import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

	let imageUrl = $state<string | undefined>(undefined);

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

</script>

<div class="camera-container">
	<h1>Camera</h1>
	<button class="btn btn-primary" onclick={takePicture}>Take Photo</button>

	{#if imageUrl}
		<div class="card">
			<h2>Photo</h2>
			<img src={imageUrl} alt="Taken with camera" />
		</div>
	{/if}
	
	<p class="info">For QR/Barcode scanning, use the Scanner tab in the navigation.</p>
</div>

<style>
	.camera-container {
		padding: 20px;
		max-width: 600px;
		margin: 0 auto;
	}
	
	h1 {
		text-align: center;
		margin-bottom: 30px;
		color: var(--color-text);
	}
	
	.btn {
		background: var(--color-theme-1);
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 16px;
		cursor: pointer;
		transition: background-color 0.2s;
		display: block;
		margin: 0 auto 20px;
	}
	
	.btn:hover {
		background: var(--color-theme-2);
	}
	
	.card {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 20px;
		margin: 20px 0;
		background: white;
	}
	
	img {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
	}
	
	.info {
		text-align: center;
		color: #666;
		font-style: italic;
		margin-top: 30px;
	}
</style>
