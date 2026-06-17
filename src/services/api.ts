// src/services/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.0.102:5000";
const API_URL = `${BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      // Inside api.ts interceptor
      if (Platform.OS !== "web") {
        // Grab the exact key we manually saved in login.tsx
        const sessionToken = await SecureStore.getItemAsync(
          "better-auth.session_token",
        );

        if (sessionToken) {
          config.headers.Authorization = `Bearer ${sessionToken}`;
        } else {
          console.warn("⚠️ No local session token found in SecureStore yet.");
        }
      }
    } catch (error) {
      console.error("Error retrieving secure token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
