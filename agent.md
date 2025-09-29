POC iOS Uber-like App (Capacitor + Svelte)

🎯 Goal

Build a Proof of Concept iOS app using Svelte + Capacitor 7 to validate Uber-like background functionality:
	•	Background location tracking (via @capacitor/background-runner + @capacitor/geolocation).
	•	Push / local notifications (ride request simulation).
	•	Local trip history storage (via @capacitor/preferences).

No backend — all mocks and storage are local.

⸻

📌 Scope

Must-Have
	1.	Background Location Tracking
	•	Foreground: track GPS with @capacitor/geolocation.
	•	Background: run isolated JS task with @capacitor/background-runner to periodically log GPS and store in Preferences.
	•	Display driver’s path in a simple Svelte map view.
	2.	Push / Local Notifications
	•	Use @capacitor/local-notifications (or @capacitor/push-notifications in dev mode) to simulate ride requests.
	•	Handle tap → deep link into Ride Detail page.
	3.	Trip History
	•	Persist trips using @capacitor/preferences.
	•	History screen shows list of trips with timestamp + distance.

Nice-to-Have
	•	“Request Ride” button → fires a local notification.
	•	SOS button → logs alert + shows confirmation dialog.
	•	Driver availability toggle → controls whether background-runner geolocation runs.

Out of Scope
	•	Payments.
	•	Real-time dispatch.
	•	Network sync.

⸻

🛠 Tech Stack (from package.json)
	•	Frontend: Svelte 5 + SvelteKit + TailwindCSS + DaisyUI.
	•	Capacitor Core: @capacitor/core, @capacitor/ios.
	•	Background Execution: @capacitor/background-runner.
	•	Geolocation: @capacitor/geolocation.
	•	Notifications: @capacitor/push-notifications, @capacitor/local-notifications (simulation).
	•	Storage: @capacitor/preferences (simple key-value, POC safe).
	•	UI Helpers: @iconify/svelte (icons).

⸻

🔑 Requirements Breakdown

1. Background Location Tracking
	•	Enable Background Modes → Location Updates in Xcode.
	•	Register a Background Runner task (e.g., tasks/location.ts).
	•	Runner task responsibilities:
	•	Get location (Geolocation.getCurrentPosition()).
	•	Save path in Preferences (append JSON).
	•	Throttle updates (e.g., 30–60s).

Acceptance Test: Lock phone, move around, reopen → path recorded in history.

⸻

2. Notifications
	•	Use LocalNotifications.schedule() to simulate:
	•	“New Ride Request” event.
	•	“Trip Complete” event.
	•	Handle notification taps to navigate to Ride Detail page.

Acceptance Test: App minimized → trigger notification → tap → app opens detail screen.

⸻

3. Trip History
	•	Each trip = JSON object {id, startTime, endTime, distance, path[]}.
	•	Store in Preferences under a trips key.
	•	History page reads/parses and lists trips.

Acceptance Test: Complete mock trip → reopen app → trip persists in history.

⸻

⚠️ Constraints
	•	Background Runner: not all Capacitor plugins are available (needs testing for Geolocation + Preferences).
	•	Permissions: iOS requires Always Allow for background GPS.
	•	Battery: location polling interval should be tuned (not real-time).

⸻

✅ Deliverables
	•	iOS app bundle (Svelte + Capacitor).
	•	Demo workflow:
	1.	Driver location tracked in background.
	2.	Rider request simulated via notification.
	3.	Trip stored + visible in history screen.