import { useEffect, useRef, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { registerForPushNotificationsAsync } from "@/services/push-token.service";
import { getNotifications, isAndroidExpoGo } from "@/services/notifications-runtime";

/**
 * Global Notification Observer:
 * 1. Synchronizes Expo push token on user authentication.
 * 2. Invalidate queries when in-app foreground notification arrives.
 * 3. Handles cold-start & background notification click deep linking without router crashes.
 * 4. Completely inert inside Android Expo Go to prevent SDK 53+ fatal warnings.
 */
export function useNotificationObserver() {
  const router = useRouter();
  const segments = useSegments();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useCurrentUser();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const pendingRouteRef = useRef<string | null>(null);

  // 1. Mark navigation as ready when router segments are mounted
  useEffect(() => {
    if (segments && segments.length > 0) {
      setIsNavigationReady(true);
    }
  }, [segments]);

  // 2. Automatically register / sync push token on login or session resume
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      void registerForPushNotificationsAsync();
    }
  }, [isAuthenticated, user?.id]);

  // 3. Cold Start: Check if app was opened directly from a notification click
  useEffect(() => {
    if (isAndroidExpoGo) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    let isSubscribed = true;

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!isSubscribed || !response) return;
        const targetRoute = response.notification.request.content.data?.route;
        if (typeof targetRoute === "string" && targetRoute.startsWith("/")) {
          pendingRouteRef.current = targetRoute;
        }
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, []);

  // 4. Background / Foreground: Handle notification tap events
  useEffect(() => {
    if (isAndroidExpoGo) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const targetRoute = response.notification.request.content.data?.route;
        if (typeof targetRoute === "string" && targetRoute.startsWith("/")) {
          if (isNavigationReady) {
            router.push(targetRoute as any);
          } else {
            pendingRouteRef.current = targetRoute;
          }
        }
      });

    // Invalidate notification queries when notification arrives in foreground
    const receivedSubscription =
      Notifications.addNotificationReceivedListener(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [isNavigationReady, queryClient, router]);

  // 5. Safely flush pending cold-start navigation once navigation tree is ready
  useEffect(() => {
    if (isNavigationReady && pendingRouteRef.current) {
      const destination = pendingRouteRef.current;
      pendingRouteRef.current = null;
      // Slight delay ensures the root layout stack transition finishes completely
      const timer = setTimeout(() => {
        router.push(destination as any);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isNavigationReady, router]);
}
