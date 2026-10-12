import { Slot } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";

// Complete any pending web auth sessions (for Google OAuth popups on web)
WebBrowser.maybeCompleteAuthSession();

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

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#0D9488",
        height: "auto",
        minHeight: 62,
        paddingVertical: 10,
      }}
      text1Style={{ fontSize: 14.5, fontWeight: "700", color: "#0D1E42" }}
      text2Style={{ fontSize: 13, color: "#64748B", lineHeight: 18 }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        height: "auto",
        minHeight: 62,
        paddingVertical: 10,
      }}
      text1Style={{ fontSize: 14.5, fontWeight: "700", color: "#0D1E42" }}
      text2Style={{ fontSize: 13, color: "#64748B", lineHeight: 18 }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
    />
  ),
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
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
