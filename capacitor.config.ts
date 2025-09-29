/// <reference types="@capacitor/background-runner" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.example.app',
	appName: 'capacitor-poc2',
	webDir: 'build',
	plugins: {
		SplashScreen: {
			launchAutoHide: false,
			launchShowDuration: 0
		},
		BackgroundRunner: {
			label: 'com.example.background.location',
			src: 'runners/location.js',
			event: 'locationUpdate',
			repeat: true,
			interval: 30,
			autoStart: false
		}
	}
};

export default config;
