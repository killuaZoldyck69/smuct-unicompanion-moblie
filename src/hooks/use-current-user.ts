import { useQuery } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { authClient } from "../services/auth-client";
import { UserRole, User } from "../types/auth";

export interface CurrentUserResult {
  user: User | null;
  role: UserRole;
  session: any;
  isPending: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

export const useCurrentUser = (): CurrentUserResult => {
  const { data, isLoading, isPending, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      // 1. First attempt Better Auth getSession()
      try {
        const sessionRes = await authClient.getSession();
        if (sessionRes.data?.user) {
          if (Platform.OS !== "web") {
            await SecureStore.setItemAsync(
              "better-auth_session_data",
              JSON.stringify(sessionRes.data),
            );
          }
          return sessionRes.data;
        }
      } catch (e) {
        // Fallback to local SecureStore if offline or fast recovery
      }

      // 2. Fallback to SecureStore cached session data
      if (Platform.OS !== "web") {
        try {
          const cachedJson = await SecureStore.getItemAsync(
            "better-auth_session_data",
          );
          if (cachedJson) {
            const parsed = JSON.parse(cachedJson);
            if (parsed?.user) {
              return parsed;
            }
          }
        } catch {}
      }

      return null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const session = data?.session || data;
  const rawRole = (data?.user as any)?.role;
  const role: UserRole =
    rawRole === "TEACHER" || rawRole === "ADMIN" || rawRole === "STUDENT"
      ? rawRole
      : "STUDENT";

  const user = data?.user ? ({ ...data.user, role } as User) : null;
  const pending = isLoading || isPending;

  return {
    user,
    role,
    session,
    isPending: pending,
    isAuthenticated: !!user,
    refetch,
  };
};

export default useCurrentUser;
