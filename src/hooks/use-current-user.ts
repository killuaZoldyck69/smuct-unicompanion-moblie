import { useQuery } from "@tanstack/react-query";
import { authClient } from "../services/auth-client";
import {
  clearStoredAuthSession,
  getStoredSessionData,
  setStoredSessionData,
} from "../services/session-storage";
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
      try {
        const sessionRes = await authClient.getSession();
        const errStatus = (sessionRes as any)?.error?.status;

        if (errStatus === 401 || errStatus === 403) {
          await clearStoredAuthSession();
          return null;
        }

        if (sessionRes?.data?.user) {
          if ((sessionRes.data.user as any).isRestricted) {
            await clearStoredAuthSession();
            return null;
          }
          await setStoredSessionData(sessionRes.data);
          return sessionRes.data;
        }

        // Only treat missing user as logged-out when there was no transport/server error
        if (!sessionRes?.error) {
          await clearStoredAuthSession();
          return null;
        }
      } catch {
        // Offline or network failure: fall back to cached session below
      }

      return await getStoredSessionData();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const session = data?.session || data;
  const rawRole = (data?.user as any)?.role;
  const role: UserRole =
    rawRole === "TEACHER" || rawRole === "ADMIN" || rawRole === "STUDENT"
      ? rawRole
      : "STUDENT";

  const user = data?.user ? ({ ...data.user, role } as User) : null;

  return {
    user,
    role,
    session,
    isPending: isPending || isLoading,
    isAuthenticated: !!user,
    refetch,
  };
};
