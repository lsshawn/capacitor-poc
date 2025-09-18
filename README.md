# Local development

1. `pnpm install`
2. `pnpm dev` to view the app in localhost:5173

To build for android:
1. `pnpm cap:android`. This will build and open android studio
2. In android studio, go to the hamburger menu and select `Build > Generate App Bundles or APKs > Generate APKs`
3. The generate APK is in `./android/app/build/outputs/apk/debug/app-debug.apk`
 

To build for ios:
> Note: I've not properly configure ios. Please go through capacitor documentation to set it up
1. `pnpm cap:ios`. This will build and open xcode
2. build for test flight?

# Background Runner

Read this documentation as there may more settings for ios and Android.

Also be aware of some limitations like how long can a background task run.

https://capacitorjs.com/docs/apis/background-runner
