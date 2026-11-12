import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const SESSION_DATA_KEY = "better-auth_session_data";
export const SESSION_TOKEN_KEY = "better-auth.session_token";
export const COOKIE_MAP_KEY = "better-auth_cookie";
export const ONBOARDING_COMPLETED_KEY = "smuct_onboarding_completed";

const SESSION_COOKIE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function readStorageItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(key)
        : null;
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeStorageItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Non-fatal storage failure
  }
}

export async function getStoredSessionToken(): Promise<string | null> {
  const directToken = await readStorageItem(SESSION_TOKEN_KEY);
  if (directToken) return directToken;

  if (Platform.OS !== "web") {
    const cookieJson = await readStorageItem(COOKIE_MAP_KEY);
    if (cookieJson) {
      try {
        const parsed = JSON.parse(cookieJson);
        const tokenFromCookie =
          parsed["better-auth.session_token"]?.value ||
          parsed["__Secure-better-auth.session_token"]?.value;
        if (tokenFromCookie) return String(tokenFromCookie);
      } catch {
        // ignore malformed cookie map
      }
    }
  }

  const sessionData = await getStoredSessionData<any>();
  return sessionData?.session?.token ? String(sessionData.session.token) : null;
}

export async function setStoredSessionToken(token: string): Promise<void> {
  if (!token) return;
  await writeStorageItem(SESSION_TOKEN_KEY, token);

  if (Platform.OS !== "web") {
    const cookiePayload = JSON.stringify({
      "better-auth.session_token": {
        value: token,
        expires: new Date(Date.now() + SESSION_COOKIE_TTL_MS).toISOString(),
      },
    });
    await writeStorageItem(COOKIE_MAP_KEY, cookiePayload);
  }
}

export async function getStoredSessionData<T = any>(): Promise<T | null> {
  try {
    const raw = await readStorageItem(SESSION_DATA_KEY);
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
    await writeStorageItem(SESSION_DATA_KEY, serialized);
  } catch {
    // Non-fatal storage failure
  }
}

export async function getStoredOnboardingState(): Promise<boolean | null> {
  const raw = await readStorageItem(ONBOARDING_COMPLETED_KEY);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

export async function setStoredOnboardingState(
  completed: boolean,
): Promise<void> {
  await writeStorageItem(ONBOARDING_COMPLETED_KEY, completed ? "true" : "false");
}

export async function persistAuthSession(params: {
  token?: string | null;
  user?: unknown;
  session?: Record<string, unknown> | null;
  onboarded?: boolean;
}): Promise<void> {
  const { token, user, session, onboarded } = params;
  if (token) {
    await setStoredSessionToken(token);
  }
  if (user) {
    await setStoredSessionData({
      user,
      session: session ?? (token ? { token } : undefined),
    });
  }
  if (typeof onboarded === "boolean") {
    await setStoredOnboardingState(onboarded);
  }
}

export async function clearStoredAuthSession(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(SESSION_DATA_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(COOKIE_MAP_KEY);
        localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
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
    SecureStore.deleteItemAsync(ONBOARDING_COMPLETED_KEY),
  ]);
}
