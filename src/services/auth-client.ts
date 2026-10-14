import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
}

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const AUTH_URL = `${BASE_URL}/api/auth`;

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
      let token: string | null = null;
      if (Platform.OS === "web") {
        token = typeof localStorage !== "undefined" ? localStorage.getItem("better-auth.session_token") : null;
      } else {
        token = await SecureStore.getItemAsync("better-auth.session_token");
        if (!token) {
          const cookieJson = await SecureStore.getItemAsync("better-auth_cookie");
          if (cookieJson) {
            try {
              const parsed = JSON.parse(cookieJson);
              token =
                parsed["better-auth.session_token"]?.value ||
                parsed["__Secure-better-auth.session_token"]?.value;
            } catch {}
          }
        }
      }

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
        if (Platform.OS === "web") {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("better-auth.session_token", rawToken);
          }
        } else {
          await SecureStore.setItemAsync("better-auth.session_token", rawToken);
          const cookiePayload = JSON.stringify({
            "better-auth.session_token": {
              value: rawToken,
              expires: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
          });
          await SecureStore.setItemAsync("better-auth_cookie", cookiePayload);
        }
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


