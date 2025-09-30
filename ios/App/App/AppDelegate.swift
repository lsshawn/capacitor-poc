import UIKit
import Capacitor
// 1. Import the BackgroundTasks framework
import BackgroundTasks
// Import the BackgroundRunner plugin module
import CapacitorBackgroundRunner
// Import UserNotifications framework for notifications
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // 2. Register the background task handler on app launch
        self.registerBackgroundTasks()
        
        // Register for push notifications
        UNUserNotificationCenter.current().delegate = self
        
        return true
    }
    
    // 3. Add this new function to register your background task
    func registerBackgroundTasks() {
        // Use the same identifier that you used in Info.plist
        let taskIdentifier = "com.example.background.location"
        
        BGTaskScheduler.shared.register(forTaskWithIdentifier: taskIdentifier, using: nil) { task in
            // This is the launch handler that will be called when the background task runs.
            self.handleAppRefresh(task: task as! BGAppRefreshTask)
        }
    }
    
    // 4. Add this new function to handle the task logic
    func handleAppRefresh(task: BGAppRefreshTask) {
        // Schedule the next refresh task, as recommended by Apple.
        scheduleAppRefresh()

        // The task must be processed on a background thread.
        let queue = DispatchQueue.global(qos: .background)
        queue.async {
            do {
                // Execute the runner and handle the task.
                // The `execute` method will load and run your background.js script.
                if let config = BackgroundRunner.shared.config {
                    _ = try BackgroundRunner.shared.execute(config: config)
                    print("Background task finished successfully.")
                    task.setTaskCompleted(success: true)
                } else {
                    print("Background runner config not found.")
                    task.setTaskCompleted(success: false)
                }
            } catch {
                print("Background task failed to execute: \(error)")
                task.setTaskCompleted(success: false)
            }
        }

        // Set an expiration handler in case the task takes too long.
        task.expirationHandler = {
            print("Background task expired.")
            task.setTaskCompleted(success: false)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
        
        // 6. Schedule the task when the app enters the background
        scheduleAppRefresh()
    }
    
    // 5. Add this new function to schedule future tasks
    func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "com.example.background.location")
        // Set the earliest time the task can run. iOS will decide the exact time.
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes from now
        
        do {
            try BGTaskScheduler.shared.submit(request)
            print("Successfully scheduled background task.")
        } catch {
            print("Could not schedule background task: \(error)")
        }
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call.
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call.
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate {
    
    // This method is called when a notification is delivered to a foreground app.
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Show the notification even when the app is in foreground
        completionHandler([.alert, .sound, .badge])
    }
    
    // This method is called when the user interacts with a notification.
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        // Handle notification tap
        NotificationCenter.default.post(name: .capacitorNotificationResponse, object: response)
        completionHandler()
    }
    
    // For push notifications
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
    
}
