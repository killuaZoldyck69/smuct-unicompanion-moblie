import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const { error } = await authClient.verifyEmail({
          query: { token },
        });

        if (error) throw new Error(error.message);

        setStatus("success");
        Toast.show({ type: "success", text1: "Email verified successfully!" });

        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2000);
      } catch (error: any) {
        setStatus("error");
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: error.message,
        });
      }
    };

    verify();
  }, [token]);

  // Render a loading state, success state, or error state based on the `status` variable.
  // ... Insert your existing Verify Email UI here ...
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {status === "loading" && (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
      {status === "success" && <Text>Email Verified! Redirecting...</Text>}
      {status === "error" && <Text>Invalid or expired verification link.</Text>}
    </View>
  );
}
