/// <reference types="@capacitor/background-runner" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.example.app',
	appName: 'capacitor-poc2',
	webDir: 'build',
	plugins: {
		BackgroundRunner: {
			label: 'com.example.background.task',
			src: 'runners/background.js',
			event: 'locationUpdate',
			repeat: true,
			interval: 1,
			autoStart: true
		}
	}
};

export default config;
