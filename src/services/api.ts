// src/services/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { authClient } from "./auth-client";

if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
}

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_URL = `${BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Retrieves the session token or formatted cookie from Better Auth / SecureStore
 */
async function getAuthCredentials(): Promise<{
  token?: string;
  cookie?: string;
}> {
  try {
    // 1. Web platform: immediate localStorage resolution
    if (Platform.OS === "web") {
      const token =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("better-auth.session_token") || undefined
          : undefined;
      return { token };
    }

    let cookie = (authClient as any).getCookie?.();
    let token: string | undefined;

    // 2. If authClient returns formatted cookie string, parse session token
    if (typeof cookie === "string") {
      const match = cookie.match(
        /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/,
      );
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }
    } else {
      cookie = undefined;
    }

    // 2. Fallback to SecureStore stored cookie map
    if (!token) {
      const storedCookieJson = await SecureStore.getItemAsync("better-auth_cookie");
      if (storedCookieJson) {
        try {
          const parsed = JSON.parse(storedCookieJson);
          const cookieObj =
            parsed["better-auth.session_token"] ||
            parsed["__Secure-better-auth.session_token"];
          if (cookieObj?.value) {
            token = cookieObj.value;
            if (!cookie) {
              cookie = `better-auth.session_token=${token}`;
            }
          }
        } catch {
          // ignore parse error
        }
      }
    }

    // 3. Fallback to SecureStore session cache
    if (!token) {
      const storedSessionJson = await SecureStore.getItemAsync(
        "better-auth_session_data",
      );
      if (storedSessionJson) {
        try {
          const parsed = JSON.parse(storedSessionJson);
          if (parsed?.session?.token) {
            token = parsed.session.token;
            if (!cookie) {
              cookie = `better-auth.session_token=${token}`;
            }
          }
        } catch {
          // ignore parse error
        }
      }
    }

    // 4. Legacy fallback
    if (!token) {
      const legacyToken = await SecureStore.getItemAsync(
        "better-auth.session_token",
      );
      if (legacyToken) {
        token = legacyToken;
        if (!cookie) {
          cookie = `better-auth.session_token=${token}`;
        }
      }
    }

    return { token, cookie };
  } catch (error) {
    console.error("Error retrieving auth credentials:", error);
    return {};
  }
}

api.interceptors.request.use(
  async (config) => {
    try {
      const { token, cookie } = await getAuthCredentials();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (cookie && !config.headers.cookie && Platform.OS !== "web") {
        config.headers.cookie = cookie;
      }
    } catch (error) {
      console.error("Error attaching auth headers:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
