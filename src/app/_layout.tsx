import { Slot } from "expo-router";
import { Platform, StatusBar, Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import {
  useFonts,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
} from "@expo-google-fonts/onest";

import { toastConfig } from "@/components/ui/toast-config";
import { useNotificationObserver } from "@/features/notifications/useNotificationObserver";

// Complete any pending web auth sessions (for Google OAuth popups on web)
WebBrowser.maybeCompleteAuthSession();

// ============================================================================
// 1. SYSTEM FONT SCALING LOCK (FOR ANDROID & ALL DEVICES)
// ============================================================================
// Ensures exact, predictable typography sizes across all Android devices,
// preventing user OS-level display/font size sliders from distorting layouts.
type CustomTextComponent = React.ComponentType<any> & {
  defaultProps?: { allowFontScaling?: boolean; maxFontSizeMultiplier?: number };
};
const CustomText = Text as unknown as CustomTextComponent;
if (CustomText.defaultProps == null) CustomText.defaultProps = {};
CustomText.defaultProps.allowFontScaling = false;

const CustomTextInput = TextInput as unknown as CustomTextComponent;
if (CustomTextInput.defaultProps == null) CustomTextInput.defaultProps = {};
CustomTextInput.defaultProps.allowFontScaling = false;

// ============================================================================
// 2. WEB ACCESSIBILITY & GOOGLE FONTS INJECTION
// ============================================================================
if (Platform.OS === "web" && typeof document !== "undefined") {
  // Inject Google Fonts web stylesheet for instant CDN rendering of Bricolage Grotesque & Onest
  if (!document.getElementById("smuct-google-fonts")) {
    const link = document.createElement("link");
    link.id = "smuct-google-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;700;800&family=Onest:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "smuct-global-fonts";
    style.innerHTML = `
      body, button, input, select, textarea {
        font-family: 'Onest', sans-serif !important;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Bricolage Grotesque', sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Prevent web "Blocked aria-hidden on an element because its descendant retained focus"
  if (typeof Element !== "undefined") {
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
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
    "BricolageGrotesque-SemiBold": BricolageGrotesque_600SemiBold,
    "BricolageGrotesque-Bold": BricolageGrotesque_700Bold,
    "BricolageGrotesque-ExtraBold": BricolageGrotesque_800ExtraBold,
    "Onest-Regular": Onest_400Regular,
    "Onest-Medium": Onest_500Medium,
    "Onest-SemiBold": Onest_600SemiBold,
    "Onest-Bold": Onest_700Bold,
    "Bricolage Grotesque": BricolageGrotesque_700Bold,
    Onest: Onest_400Regular,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
