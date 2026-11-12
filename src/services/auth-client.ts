import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_BASE_URL } from "./api-config";
import { getStoredSessionToken, setStoredSessionToken } from "./session-storage";

const AUTH_URL = `${API_BASE_URL}/api/auth`;

export interface EmailOtpClientMethods {
  sendVerificationOtp: (params: {
    email: string;
    type: "email-verification" | "forget-password" | "sign-in" | "change-email";
  }) => Promise<{ data: any; error: any }>;
  verifyEmail: (params: {
    email: string;
    otp: string;
  }) => Promise<{ data: any; error: any }>;
  requestPasswordReset: (params: {
    email: string;
  }) => Promise<{ data: any; error: any }>;
  resetPassword: (params: {
    email: string;
    otp: string;
    password: string;
  }) => Promise<{ data: any; error: any }>;
}

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  fetchOptions: {
    credentials: "include",
    headers:
      Platform.OS !== "web" ? { Origin: "smuct-unicompanion://" } : undefined,
    onRequest: async (context) => {
      const token = await getStoredSessionToken();

      if (token) {
        context.headers.set("Authorization", `Bearer ${token}`);
        if (Platform.OS !== "web") {
          context.headers.set("cookie", `better-auth.session_token=${token}`);
        }
      }

      if (Platform.OS !== "web") {
        context.headers.set("Origin", "smuct-unicompanion://");
      }
    },
    onSuccess: async (context) => {
      const rawToken =
        (context.data as any)?.token ||
        (context.data as any)?.session?.token;
      if (rawToken) {
        await setStoredSessionToken(String(rawToken));
      }
    },
  },
  plugins: [
    emailOTPClient(),
    ...(Platform.OS !== "web"
      ? [expoClient({ scheme: "smuct-unicompanion", storage: SecureStore }) as any]
      : []),
  ],
}) as ReturnType<typeof createAuthClient> & {
  emailOtp: EmailOtpClientMethods;
};


