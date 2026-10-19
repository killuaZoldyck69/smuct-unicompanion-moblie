import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  restrictedUsers: number;
  pendingApprovals: number;
  activeNotices: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type:
    | "USER_JOINED"
    | "USER_RESTRICTED"
    | "TEACHER_ADDED"
    | "NOTICE_POSTED"
    | "COMPLAINT_FILED"
    | "MAINTENANCE_RUN";
  title: string;
  subtitle: string;
  timestamp: string;
}

export interface SystemHealth {
  isOnline: boolean;
  latencyMs: number;
  status: string;
  timestamp?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  // ── System Health (live ping every 60s) ──
  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
    isFetching: isHealthFetching,
  } = useQuery<SystemHealth>({
    queryKey: ["admin-dashboard-health"],
    queryFn: async (): Promise<SystemHealth> => {
      const startTime = Date.now();
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
      try {
        const res = await axios.get(`${baseUrl}/health`, { timeout: 8000 });
        return {
          isOnline: res.data?.status === "ok",
          latencyMs: Date.now() - startTime,
          status: res.data?.status ?? "unknown",
          timestamp: res.data?.timestamp,
        };
      } catch {
        return { isOnline: false, latencyMs: 0, status: "offline" };
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // ── Dashboard Stats ──
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isRefetching: isStatsRefetching,
  } = useQuery<AdminDashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async (): Promise<AdminDashboardStats> => {
      try {
        const res = await api.get("/admin/dashboard-stats");
        const d = res.data?.data;
        return {
          totalStudents: d?.totalStudents ?? 0,
          totalTeachers: d?.totalTeachers ?? 0,
          totalUsers: d?.totalUsers ?? 0,
          restrictedUsers: d?.restrictedUsers ?? 0,
          pendingApprovals: d?.pendingApprovals ?? 0,
          activeNotices: d?.activeNotices ?? 0,
          recentActivity: d?.recentActivity ?? [],
        };
      } catch {
        // Return zeros gracefully — the UI handles empty state
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalUsers: 0,
          restrictedUsers: 0,
          pendingApprovals: 0,
          activeNotices: 0,
          recentActivity: [],
        };
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  const refetchAll = () => {
    refetchHealth();
    refetchStats();
  };

  return {
    health: healthData ?? { isOnline: false, latencyMs: 0, status: "checking" },
    stats,
    isStatsLoading,
    isHealthLoading,
    isHealthFetching,
    isRefreshing: isStatsRefetching,
    refetch: refetchAll,
  };
}
