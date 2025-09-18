addEventListener('locationUpdate', async (resolve, reject) => {
	try {
		console.log('Background task: getting position...');
		const position = await CapacitorGeolocation.getCurrentPosition();
		const { latitude, longitude, accuracy } = position;

		const body = `Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`;
		console.log(`Sending: ${body}`);

		await fetch('https://ntfy.sh/jayride-uptime', {
			method: 'POST',
			body: body,
			headers: {
				Title: 'GPS Location Update'
			}
		});

		console.log('Location sent to ntfy.sh');
		resolve();
	} catch (err) {
		console.error('Error in background locationUpdate', err);
		reject(err);
	}
});
