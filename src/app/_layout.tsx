import { Slot } from "expo-router";
import { Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";

import { toastConfig } from "@/components/ui/toast-config";
import { useNotificationObserver } from "@/features/notifications/useNotificationObserver";

// Complete any pending web auth sessions (for Google OAuth popups on web)
WebBrowser.maybeCompleteAuthSession();

// Prevent web "Blocked aria-hidden on an element because its descendant retained focus"
// warnings when Expo Router / React Navigation hides inactive tab/stack screens or modals.
// Using the HTML `inert` attribute hides inactive containers from assistive technology
// while also preventing any descendant from retaining or receiving focus.
if (
  Platform.OS === "web" &&
  typeof Element !== "undefined" &&
  typeof document !== "undefined"
) {
  const rawSetAttribute: typeof Element.prototype.setAttribute =
    (Element.prototype.setAttribute as any).__rawSetAttribute ||
    Element.prototype.setAttribute;
  const rawRemoveAttribute: typeof Element.prototype.removeAttribute =
    (Element.prototype.removeAttribute as any).__rawRemoveAttribute ||
    Element.prototype.removeAttribute;

  if (!(Element.prototype.setAttribute as any).__ariaHiddenInertPatched) {
    const patchedSetAttribute = function (
      this: Element,
      name: string,
      value: string,
    ) {
      if (name.toLowerCase() === "aria-hidden") {
        if (String(value) === "true") {
          if (
            document.activeElement instanceof HTMLElement &&
            (this === document.activeElement ||
              this.contains(document.activeElement))
          ) {
            document.activeElement.blur();
          }
          rawRemoveAttribute.call(this, "aria-hidden");
          return rawSetAttribute.call(this, "inert", "");
        }
        rawRemoveAttribute.call(this, "inert");
        return rawRemoveAttribute.call(this, "aria-hidden");
      }
      return rawSetAttribute.call(this, name, value);
    };
    (patchedSetAttribute as any).__rawSetAttribute = rawSetAttribute;
    (patchedSetAttribute as any).__ariaHiddenInertPatched = true;
    Element.prototype.setAttribute = patchedSetAttribute;

    const patchedRemoveAttribute = function (this: Element, name: string) {
      if (name.toLowerCase() === "aria-hidden") {
        rawRemoveAttribute.call(this, "inert");
      }
      return rawRemoveAttribute.call(this, name);
    };
    (patchedRemoveAttribute as any).__rawRemoveAttribute = rawRemoveAttribute;
    Element.prototype.removeAttribute = patchedRemoveAttribute;

    document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
      if (
        document.activeElement instanceof HTMLElement &&
        (el === document.activeElement || el.contains(document.activeElement))
      ) {
        document.activeElement.blur();
      }
      rawRemoveAttribute.call(el, "aria-hidden");
      rawSetAttribute.call(el, "inert", "");
    });
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

function NotificationLifecycle() {
  useNotificationObserver();
  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NotificationLifecycle />
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <Slot />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
