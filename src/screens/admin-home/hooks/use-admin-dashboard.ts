import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from "@/services/api";
import { API_BASE_URL } from "@/services/api-config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  restrictedUsers: number;
  totalCourseHubs: number;
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
  isDegraded: boolean;
  dbStatus: "connected" | "unavailable" | "unknown";
  latencyMs: number;
  status: string;
  timestamp?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  // ── System Readiness (live ping every 60s against /health/ready) ──
  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
    isFetching: isHealthFetching,
  } = useQuery<SystemHealth>({
    queryKey: ["admin-dashboard-health"],
    queryFn: async (): Promise<SystemHealth> => {
      const startTime = Date.now();
      try {
        const res = await axios.get(`${API_BASE_URL}/health/ready`, {
          timeout: 8000,
          validateStatus: (status) => status === 200 || status === 503,
        });
        const latencyMs = Date.now() - startTime;
        const dbStatus = res.data?.db === "connected" ? "connected" : "unavailable";
        const isOperational = res.status === 200 && res.data?.status === "ok";

        return {
          isOnline: true,
          isDegraded: !isOperational,
          dbStatus,
          latencyMs,
          status: res.data?.status ?? (isOperational ? "ok" : "degraded"),
          timestamp: res.data?.timestamp,
        };
      } catch {
        return {
          isOnline: false,
          isDegraded: false,
          dbStatus: "unknown",
          latencyMs: 0,
          status: "offline",
        };
      }
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });

  // ── Dashboard Stats ──
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
    isRefetching: isStatsRefetching,
  } = useQuery<AdminDashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async (): Promise<AdminDashboardStats> => {
      const res = await api.get("/admin/dashboard-stats");
      const d = res.data?.data;
      if (!d) {
        throw new Error("Missing dashboard stats payload");
      }
      return {
        totalStudents: d.totalStudents ?? 0,
        totalTeachers: d.totalTeachers ?? 0,
        totalUsers: d.totalUsers ?? 0,
        restrictedUsers: d.restrictedUsers ?? 0,
        totalCourseHubs: d.totalCourseHubs ?? 0,
        recentActivity: d.recentActivity ?? [],
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  const refetchAll = async () => {
    await Promise.allSettled([refetchHealth(), refetchStats()]);
  };

  return {
    health: healthData ?? {
      isOnline: false,
      isDegraded: false,
      dbStatus: "unknown",
      latencyMs: 0,
      status: "checking",
    },
    stats,
    isStatsLoading,
    isStatsError,
    isHealthLoading,
    isHealthFetching,
    isRefreshing: isStatsRefetching,
    refetch: refetchAll,
  };
}
