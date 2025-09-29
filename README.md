# Capacitor Background Runner POC

A simple proof-of-concept app demonstrating **Capacitor Background Runner** functionality with an auto-starting heartbeat that runs continuously in the background.

## 🎯 What This Proves

This app demonstrates that:
- ✅ Background tasks can run when the app is backgrounded/minimized
- ✅ JavaScript code executes continuously in background contexts
- ✅ Background runners can maintain activity without user interaction
- ✅ Console logs prove background execution is working


Features Implemented:

1. Background Location Tracking 
- Foreground tracking via `watchPosition`
- Background coordination via `BackgroundRunner`
- Location data saved to trip paths

2. Push/Local Notifications 
- Ride request simulation working
- Notification tap handlers registered
- Deep linking to ride details ready

3. Trip History 
- Persistent storage via Preferences
- Real location points being saved
- Trip data accumulating correctly

[iOS Video Demo](./static/ios-demo-video.mp4)

Note: Push notification doesn't work in Android at the moment because it requires [Firebase](https://capacitorjs.com/docs/apis/push-notifications#android)

## 🚀 Quick Start

### Local Development
1. `pnpm install`
2. `pnpm dev` - View the app at localhost:5173 (web preview)

### Android Testing
1. `pnpm cap:android` - Builds and opens Android Studio
2. In Android Studio: `Build > Generate App Bundles or APKs > Generate APKs`
3. Install APK: `./android/app/build/outputs/apk/debug/app-debug.apk`
4. **Test background execution**: Launch app → minimize → wait 30+ seconds → return to see proof

### iOS Testing
> **Note**: iOS may need additional configuration. See [Capacitor docs](https://capacitorjs.com/docs/apis/background-runner) for iOS-specific setup.
1. `pnpm cap:ios` - Builds and opens Xcode
2. Build and deploy to device/simulator

## 🔬 How to Test Background Execution

### Method 1: Console Logs (Recommended)
1. **Launch the app** on device/emulator with debugging enabled
2. **Open developer console** (Android Studio Logcat, Safari Web Inspector, etc.)
3. **Background the app** (home button, app switcher)
4. **Wait 30-60 seconds**
5. **Check console** - you should see continuous `💓 Heartbeat #X` logs every 3 seconds
6. **Return to app** - UI shows background activity data

### Method 2: UI Evidence
1. Launch app and note the timestamp
2. Put app in background for 1+ minute
3. Return to app
4. UI shows updated "Instance Uptime" and timestamps proving background execution

## 🏗️ Architecture

### Background Runner (`static/runners/background.js`)
- **Auto-starts** immediately when script loads
- **Heartbeat timer** runs every 3 seconds
- **Logs activity** to console with timestamps
- **Multiple instances** can run (Capacitor creates new contexts per event)
- **~80 lines** of clean, minimal code

### Frontend (`src/routes/+page.svelte`)
- **Status monitoring** - polls background runner every 2 seconds
- **Real-time display** - shows latest heartbeat data
- **Clean UI** - minimal interface focused on proof-of-concept
- **Auto-running** - no manual start/stop needed

### Configuration (`capacitor.config.ts`)
- **Background Runner enabled** with auto-start
- **Event-based communication** for status reporting
- **Cross-platform compatible** (iOS + Android)

## 🧩 Key Files

```
├── static/runners/background.js    # Background heartbeat logic
├── src/routes/+page.svelte         # Main UI with status display  
├── capacitor.config.ts             # Background runner configuration
└── README.md                       # This file
```

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|---------|
| **Android** | ✅ Tested | Full background execution support |
| **iOS** | 🚧 Needs Config | May require additional permissions/setup |
| **Web** | ⚠️ Limited | Background tabs have execution limits |

## 🐛 Troubleshooting

### Background Runner Not Working?
1. **Check console logs** - should see `🚀 Background runner script loaded`
2. **Verify permissions** - some platforms require background execution permissions
3. **Platform limitations** - iOS/Android may kill long-running background tasks
4. **Battery optimization** - disable battery optimization for the app

### UI Not Updating?
1. **Console shows heartbeat logs** but UI stuck? → Background runner is working, UI polling issue
2. **No console logs at all** → Background runner not starting, check config
3. **Logs stop after backgrounding** → Platform killed background task (expected on some devices)

## 📚 Background Runner Limitations

⚠️ **Important**: Background execution time varies by platform:
- **Android**: Usually 30s-5min depending on battery optimization
- **iOS**: Very limited (seconds to minutes) unless using specific background modes
- **Web**: Limited by browser tab throttling

## 🔗 Resources

- [Capacitor Background Runner Docs](https://capacitorjs.com/docs/apis/background-runner)
- [Background Execution Best Practices](https://developer.android.com/guide/background)
- [iOS Background App Refresh](https://developer.apple.com/documentation/backgroundtasks)

## 🎉 Success Criteria

✅ **Background runner is working if you see**:
- Continuous `💓 Heartbeat #X` console logs every 3 seconds
- Logs continue for 30+ seconds when app is backgrounded
- UI shows increasing "Instance Uptime" values
- Multiple background instances may run simultaneously

---

*This POC demonstrates core background execution capabilities. Production apps should implement proper task management, error handling, and respect platform-specific background execution limits.*
