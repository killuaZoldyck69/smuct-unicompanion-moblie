import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import api from "./api";

// Configure foreground presentation behavior safely
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Initializes Android notification channels, requests OS permissions,
 * and synchronizes the unique Expo push token with the backend server.
 * Completely guarded against emulators, Expo Go limits, and offline errors.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // 1. Guard against virtual devices / emulators
    if (!Device.isDevice) {
      console.info("[Push] Virtual device detected. Push notifications require a physical device.");
      return null;
    }

    // 2. Guard against standard Expo Go limitation on Android (FCM v1 requirement)
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (isExpoGo && Platform.OS === "android") {
      console.warn(
        "[Push] Expo Go on Android does not support FCM v1 remote push notifications. " +
          "Please test using a Development Build (expo-dev-client) or Preview APK.",
      );
      return null;
    }

    // 3. Android 8.0+ Mandatory Notification Channel Setup
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "General Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4f46e5",
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    // 4. Permission handling (Mandatory on Android 13+ / iOS)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.info("[Push] Notification permission not granted by user.");
      return null;
    }

    // 5. Retrieve project ID from Expo / EAS config
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      "e5163abb-47dc-4ffe-9cf6-40b794db19a3";

    if (!projectId) {
      console.warn("[Push] EAS Project ID could not be resolved.");
      return null;
    }

    // 6. Obtain Expo Push Token
    const pushTokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = pushTokenResult.data;

    if (!token) return null;

    // 7. Synchronize token with backend API
    await api.post("/notifications/push-token", {
      token,
      platform: Platform.OS,
    });

    return token;
  } catch (error) {
    // Defensive design: never allow notification registration errors to crash the app
    console.warn("[Push] Push token registration skipped or failed:", error);
    return null;
  }
}

/**
 * Revokes the device's push token from the backend database on sign out.
 */
export async function unregisterPushNotificationsAsync(token?: string): Promise<void> {
  try {
    let tokenToRevoke = token;
    if (!tokenToRevoke) {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId ??
        "e5163abb-47dc-4ffe-9cf6-40b794db19a3";
      if (projectId && Device.isDevice) {
        const result = await Notifications.getExpoPushTokenAsync({ projectId }).catch(() => null);
        tokenToRevoke = result?.data;
      }
    }

    if (tokenToRevoke) {
      await api.delete("/notifications/push-token", {
        data: { token: tokenToRevoke },
      });
    }
  } catch (error) {
    // Suppress network errors during logout unregister to prevent blocking logout
    console.warn("[Push] Unregistering push token failed:", error);
  }
}
