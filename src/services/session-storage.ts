import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const SESSION_DATA_KEY = "better-auth_session_data";
export const SESSION_TOKEN_KEY = "better-auth.session_token";
export const COOKIE_MAP_KEY = "better-auth_cookie";

export async function getStoredSessionData<T = any>(): Promise<T | null> {
  try {
    const raw =
      Platform.OS === "web"
        ? typeof localStorage !== "undefined"
          ? localStorage.getItem(SESSION_DATA_KEY)
          : null
        : await SecureStore.getItemAsync(SESSION_DATA_KEY);

    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user ? (parsed as T) : null;
  } catch {
    return null;
  }
}

export async function setStoredSessionData(data: unknown): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(SESSION_DATA_KEY, serialized);
      }
      return;
    }
    await SecureStore.setItemAsync(SESSION_DATA_KEY, serialized);
  } catch {
    // Non-fatal storage failure
  }
}

export async function clearStoredAuthSession(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(SESSION_DATA_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(COOKIE_MAP_KEY);
      }
    } catch {
      // ignore storage cleanup errors
    }
    return;
  }

  await Promise.allSettled([
    SecureStore.deleteItemAsync(SESSION_DATA_KEY),
    SecureStore.deleteItemAsync(SESSION_TOKEN_KEY),
    SecureStore.deleteItemAsync(COOKIE_MAP_KEY),
  ]);
}
