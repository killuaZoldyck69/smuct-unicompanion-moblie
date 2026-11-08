import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import type * as NotificationsType from "expo-notifications";

/**
 * Android Expo Go Detection:
 * Expo SDK 53+ intentionally throws a fatal error if expo-notifications
 * is evaluated at runtime inside Expo Go on Android because Expo Go
 * lacks custom Google Services credentials.
 */
export const isAndroidExpoGo =
  Platform.OS === "android" &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let notificationsModule: typeof NotificationsType | null = null;
let isHandlerConfigured = false;

/**
 * Lazily loads the expo-notifications module only when running in supported environments
 * (Development Builds, Standalone/Preview APKs, iOS, Web).
 * Prevents fatal initialization crashes inside standard Expo Go on Android.
 */
export function getNotifications(): typeof NotificationsType | null {
  if (isAndroidExpoGo) {
    return null;
  }

  if (notificationsModule) {
    return notificationsModule;
  }

  try {
    notificationsModule = require("expo-notifications") as typeof NotificationsType;

    // Configure foreground presentation behavior safely
    if (!isHandlerConfigured && notificationsModule) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          priority: notificationsModule!.AndroidNotificationPriority.HIGH,
        }),
      });
      isHandlerConfigured = true;
    }

    return notificationsModule;
  } catch (error) {
    console.warn("[Push] Could not load expo-notifications module:", error);
    return null;
  }
}
