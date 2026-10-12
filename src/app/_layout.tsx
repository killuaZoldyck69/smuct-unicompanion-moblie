import { Slot } from "expo-router";
import { StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { BaseToast } from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
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
        backgroundColor: "#16A34A",
        borderLeftWidth: 0,
        height: "auto",
        minHeight: 64,
        width: "92%",
        maxWidth: 420,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 6,
        shadowColor: "#15803D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="check" size={18} color="#FFFFFF" />
          </View>
        </View>
      )}
      text1Style={{
        fontSize: 14.5,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.94)",
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: "#DC2626",
        borderLeftWidth: 0,
        height: "auto",
        minHeight: 64,
        width: "92%",
        maxWidth: 420,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 6,
        shadowColor: "#991B1B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="alert-circle" size={18} color="#FFFFFF" />
          </View>
        </View>
      )}
      text1Style={{
        fontSize: 14.5,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.94)",
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: "#0284C7",
        borderLeftWidth: 0,
        height: "auto",
        minHeight: 64,
        width: "92%",
        maxWidth: 420,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 6,
        shadowColor: "#0369A1",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="info" size={18} color="#FFFFFF" />
          </View>
        </View>
      )}
      text1Style={{
        fontSize: 14.5,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.94)",
        lineHeight: 18,
      }}
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
