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
			label: 'com.example.background.fetcher',
			src: 'runners/background.js',
			event: 'status',
			repeat: false,
			interval: 15,
			autoStart: true
		}
	}
};

export default config;
