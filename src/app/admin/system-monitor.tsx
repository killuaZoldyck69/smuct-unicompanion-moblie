import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import axios from "axios";

import { api } from "@/services/api";
import { shadows } from "@/theme/layout";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PostgresDiagnostics {
  status: "healthy" | "degraded" | "error";
  usedBytes: number;
  usedFormatted: string;
  limitBytes: number;
  limitFormatted: string;
  remainingBytes: number;
  remainingFormatted: string;
  percentUsed: number;
  activeConnections: number;
  totalTables: number;
  latencyMs: number;
  databaseName?: string;
  error?: string;
}

export interface CloudinaryDiagnostics {
  status: "healthy" | "degraded" | "unconfigured" | "error";
  plan?: string;
  storageUsedBytes: number;
  storageUsedFormatted: string;
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  creditsPercentUsed: number;
  objectsCount: number;
  bandwidthUsedBytes: number;
  bandwidthUsedFormatted: string;
  error?: string;
}

export interface BrevoDiagnostics {
  status: "healthy" | "degraded" | "unconfigured" | "error";
  planType?: string;
  dailyCreditLimit: number;
  creditsRemaining: number;
  creditsUsed: number;
  creditsPercentUsed: number;
  accountEmail?: string;
  relayStatus?: string;
  error?: string;
}

export interface RuntimeDiagnostics {
  status: "healthy" | "degraded";
  uptimeSeconds: number;
  uptimeFormatted: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  memory: {
    rssBytes: number;
    rssFormatted: string;
    containerLimitBytes: number;
    containerLimitFormatted: string;
    percentContainerRam: number;
    headroomFormatted: string;

    heapUsedBytes: number;
    heapUsedFormatted: string;
    heapTotalBytes: number;
    heapTotalFormatted: string;
    heapLimitBytes: number;
    heapLimitFormatted: string;
    percentHeapUsed: number;
  };
}

export interface SystemLogItem {
  id: string;
  level: "INFO" | "SUCCESS" | "WARN" | "SYSTEM";
  service: "API" | "DATABASE" | "STORAGE" | "EMAIL" | "AUTH";
  message: string;
  timestamp: string;
}

export interface ServiceMatrixItem {
  name: string;
  category: string;
  status: "OPERATIONAL" | "DEGRADED" | "STANDBY";
  latencyMs?: number;
  info: string;
}

export interface SystemDiagnosticsResponse {
  timestamp: string;
  isOverallHealthy: boolean;
  overallLatencyMs: number;
  environment: string;
  hostNode: string;
  database: PostgresDiagnostics;
  cloudinary: CloudinaryDiagnostics;
  brevo: BrevoDiagnostics;
  runtime: RuntimeDiagnostics;
  servicesMatrix: ServiceMatrixItem[];
  systemLogs: SystemLogItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminSystemMonitorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lastCleanupResult, setLastCleanupResult] = useState<any>(null);

  // 1. Health Ping Query (Basic connectivity)
  const {
    data: healthData,
    refetch: refetchHealth,
    isFetching: isHealthFetching,
  } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: async () => {
      const startTime = Date.now();
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
      const res = await axios.get(`${baseUrl}/health`, { timeout: 8000 });
      const latencyMs = Date.now() - startTime;
      return {
        ...res.data,
        latencyMs,
      };
    },
    refetchInterval: 30000,
  });

  // 2. Comprehensive System Diagnostics Query (PostgreSQL, Cloudinary, Brevo, Node, Logs)
  const {
    data: diagnostics,
    isLoading: isDiagnosticsLoading,
    isFetching: isDiagnosticsFetching,
    refetch: refetchDiagnostics,
  } = useQuery<SystemDiagnosticsResponse>({
    queryKey: ["admin-system-diagnostics"],
    queryFn: async () => {
      const res = await api.get("/admin/system-diagnostics", {
        params: { refresh: "true" },
      });
      return res.data?.data;
    },
    refetchInterval: 30000,
  });

  // 3. Maintenance Cleanup Mutation
  const cleanupMutation = useMutation({
    mutationFn: async (hours: number = 24) => {
      const res = await api.post("/users/maintenance/cleanup", null, {
        params: { hours },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setLastCleanupResult(data.data);
      Toast.show({
        type: "success",
        text1: "Cleanup Completed",
        text2: `Purged ${data.data.unverifiedUsersDeleted} stale users, ${data.data.expiredVerificationsDeleted} OTPs.`,
        visibilityTime: 4000,
      });
      refetchHealth();
      refetchDiagnostics();
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Maintenance Failed",
        text2: err?.response?.data?.message || err.message,
      });
    },
  });

  const handleRefreshAll = () => {
    refetchHealth();
    refetchDiagnostics();
  };

  const handleRunCleanup = () => {
    cleanupMutation.mutate(24);
  };

  const isOnline = healthData?.status === "ok";
  const latency =
    diagnostics?.overallLatencyMs ?? healthData?.latencyMs ?? 0;

  const db = diagnostics?.database;
  const c = diagnostics?.cloudinary;
  const b = diagnostics?.brevo;
  const runtime = diagnostics?.runtime;
  const logs = diagnostics?.systemLogs ?? [];

  const isRefreshing = isHealthFetching || isDiagnosticsFetching;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color="#131b2e" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>System Monitor</Text>
          <Text style={styles.headerSubtitle}>Server Health & Diagnostics</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={handleRefreshAll}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          disabled={isRefreshing}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Refresh diagnostics"
        >
          <Feather
            name="refresh-cw"
            size={18}
            color={isRefreshing ? "#94a3b8" : "#131b2e"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshAll}
            colors={["#131b2e"]}
          />
        }
      >
        {/* ── 1. Production-Ready Status Hero Card ── */}
        <View style={styles.statusHeroCard}>
          {/* Top Row: Status Badge + Latency Indicator */}
          <View style={styles.heroTopRow}>
            <View style={styles.pulsingBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? "#10b981" : "#ef4444" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isOnline ? "#047857" : "#b91c1c" },
                ]}
              >
                {isOnline ? "ALL SYSTEMS OPERATIONAL" : "DEGRADED OR OFFLINE"}
              </Text>
            </View>

            <View style={styles.latencyWrap}>
              <Feather
                name="activity"
                size={12}
                color={latency > 500 ? "#f59e0b" : "#10b981"}
              />
              <Text style={styles.latencyText}>
                {latency > 0 ? `${latency} ms` : "Checking..."}
              </Text>
            </View>
          </View>

          {/* Engine Title + Environment Pill */}
          <View style={styles.titleRow}>
            <Text style={styles.heroTitle}>UniCompanion Engine</Text>
            <View style={styles.envPill}>
              <Text style={styles.envPillText}>
                {(diagnostics?.environment || "production").toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.heroDesc}>
            Primary Backend Cluster • Render Node • Uptime:{" "}
            {runtime?.uptimeFormatted || "Active"}
          </Text>

          {/* Micro-Services Live Health Strip */}
          <View style={styles.serviceMatrixBox}>
            <View style={styles.serviceMatrixItem}>
              <View
                style={[styles.matrixDot, { backgroundColor: "#10b981" }]}
              />
              <Text style={styles.matrixLabel}>API Gateway</Text>
              <Text style={styles.matrixStatus}>200 OK</Text>
            </View>

            <View style={styles.matrixDivider} />

            <View style={styles.serviceMatrixItem}>
              <View
                style={[
                  styles.matrixDot,
                  {
                    backgroundColor:
                      db?.status === "healthy" ? "#10b981" : "#ef4444",
                  },
                ]}
              />
              <Text style={styles.matrixLabel}>PostgreSQL</Text>
              <Text style={styles.matrixStatus}>
                {db?.latencyMs ? `${db.latencyMs}ms` : "Pool Active"}
              </Text>
            </View>

            <View style={styles.matrixDivider} />

            <View style={styles.serviceMatrixItem}>
              <View
                style={[
                  styles.matrixDot,
                  {
                    backgroundColor:
                      c?.status === "healthy" ? "#10b981" : "#f59e0b",
                  },
                ]}
              />
              <Text style={styles.matrixLabel}>Cloudinary</Text>
              <Text style={styles.matrixStatus}>
                {c?.objectsCount ?? 0} Assets
              </Text>
            </View>

            <View style={styles.matrixDivider} />

            <View style={styles.serviceMatrixItem}>
              <View
                style={[
                  styles.matrixDot,
                  {
                    backgroundColor:
                      b?.status === "healthy" ? "#10b981" : "#f59e0b",
                  },
                ]}
              />
              <Text style={styles.matrixLabel}>Brevo SMTP</Text>
              <Text style={styles.matrixStatus}>
                {b?.creditsRemaining ?? 300} left
              </Text>
            </View>
          </View>

          {/* Bottom Host & Timestamp Row */}
          <View style={styles.timestampRow}>
            <View style={styles.inlineInfo}>
              <Feather name="clock" size={12} color="#94a3b8" />
              <Text style={styles.timestampText}>
                Last checked:{" "}
                {diagnostics?.timestamp
                  ? new Date(diagnostics.timestamp).toLocaleTimeString()
                  : "Just now"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
              {diagnostics?.hostNode ? (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText} numberOfLines={1}>
                    {diagnostics.hostNode.split(" ")[0]}
                  </Text>
                </View>
              ) : null}
              {runtime && (
                <View style={styles.nodeBadge}>
                  <Text style={styles.nodeBadgeText}>
                    Node {runtime.nodeVersion}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── 2. Live System Observability & Audit Logs Console ── */}
        <View style={styles.logsSectionHeader}>
          <Text style={styles.sectionLabel}>
            SYSTEM OBSERVABILITY & TELEMETRY LOGS
          </Text>
          <View style={styles.liveStreamBadge}>
            <View style={styles.liveStreamDot} />
            <Text style={styles.liveStreamText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.terminalCard}>
          {/* Terminal Title Bar */}
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={[styles.termDot, { backgroundColor: "#ef4444" }]} />
              <View style={[styles.termDot, { backgroundColor: "#f59e0b" }]} />
              <View style={[styles.termDot, { backgroundColor: "#10b981" }]} />
            </View>
            <Text style={styles.terminalTitle}>engine.diagnostics.log</Text>
            <Text style={styles.terminalCount}>{logs.length} events</Text>
          </View>

          {/* Terminal Log Stream */}
          <View style={styles.terminalBody}>
            {isDiagnosticsLoading ? (
              <View style={styles.terminalLoading}>
                <ActivityIndicator size="small" color="#10b981" />
                <Text style={styles.terminalLoadingText}>
                  Streaming cluster telemetry...
                </Text>
              </View>
            ) : logs.length === 0 ? (
              <Text style={styles.terminalEmptyText}>
                No log events captured in recent cycle.
              </Text>
            ) : (
              logs.map((log) => {
                const badgeColor =
                  log.level === "SUCCESS"
                    ? "#10b981"
                    : log.level === "WARN"
                    ? "#f59e0b"
                    : log.level === "SYSTEM"
                    ? "#a855f7"
                    : "#38bdf8";

                return (
                  <View key={log.id} style={styles.logRow}>
                    <View style={styles.logMetaRow}>
                      <Text
                        style={[styles.logLevelBadge, { color: badgeColor }]}
                      >
                        [{log.level}]
                      </Text>
                      <Text style={styles.logServiceTag}>[{log.service}]</Text>
                      <Text style={styles.logTimestamp}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text style={styles.logMessage}>{log.message}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* ── 3. Storage & Service Metrics Grid ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          INFRASTRUCTURE STORAGE & QUOTAS
        </Text>
        <View style={styles.metricGrid}>
          {/* Card 1: PostgreSQL DB */}
          <View style={styles.metricCard}>
            <View style={styles.cardTopRow}>
              <View
                style={[styles.metricIconWrap, { backgroundColor: "#eff6ff" }]}
              >
                <Feather name="database" size={19} color="#2563eb" />
              </View>
              <View style={[styles.statusPill, { backgroundColor: "#eff6ff" }]}>
                <Text style={[styles.statusPillText, { color: "#2563eb" }]}>
                  {db?.status === "healthy"
                    ? "Connected"
                    : db?.status === "degraded"
                    ? "High Load"
                    : "Error"}
                </Text>
              </View>
            </View>

            <Text style={styles.metricTitle}>PostgreSQL DB</Text>

            {isDiagnosticsLoading ? (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={styles.loader}
              />
            ) : (
              <>
                <Text style={styles.statMainValue}>
                  {db?.usedFormatted || "0 B"}
                </Text>
                <Text style={styles.statSubText} numberOfLines={1}>
                  {db?.remainingFormatted || "N/A"} left of{" "}
                  {db?.limitFormatted || "512 MB"}
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.max(4, db?.percentUsed ?? 0),
                        )}%`,
                        backgroundColor:
                          (db?.percentUsed ?? 0) > 90
                            ? "#ef4444"
                            : (db?.percentUsed ?? 0) > 75
                            ? "#f59e0b"
                            : "#2563eb",
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>
                    {db?.percentUsed ?? 0}% • {db?.activeConnections ?? 1} conns
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Card 2: Cloudinary Media Storage */}
          <View style={styles.metricCard}>
            <View style={styles.cardTopRow}>
              <View
                style={[styles.metricIconWrap, { backgroundColor: "#fff7ed" }]}
              >
                <Feather name="image" size={19} color="#ea580c" />
              </View>
              <View style={[styles.statusPill, { backgroundColor: "#fff7ed" }]}>
                <Text style={[styles.statusPillText, { color: "#ea580c" }]}>
                  {c?.status === "healthy"
                    ? "Linked"
                    : c?.status === "unconfigured"
                    ? "Setup"
                    : "Active"}
                </Text>
              </View>
            </View>

            <Text style={styles.metricTitle}>Cloudinary</Text>

            {isDiagnosticsLoading ? (
              <ActivityIndicator
                size="small"
                color="#ea580c"
                style={styles.loader}
              />
            ) : (
              <>
                <Text style={styles.statMainValue}>
                  {c?.storageUsedFormatted || "0 B"}
                </Text>
                <Text style={styles.statSubText} numberOfLines={1}>
                  {c?.creditsRemaining ?? 25} credits left of{" "}
                  {c?.creditsLimit ?? 25}
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.max(4, c?.creditsPercentUsed ?? 0),
                        )}%`,
                        backgroundColor:
                          (c?.creditsPercentUsed ?? 0) > 90
                            ? "#ef4444"
                            : (c?.creditsPercentUsed ?? 0) > 75
                            ? "#f59e0b"
                            : "#ea580c",
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.footerText} numberOfLines={1}>
                    {c?.objectsCount ?? 0} assets • {c?.plan || "Free"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Card 3: Brevo Mail Engine (Full Width) */}
          <View style={[styles.metricCard, styles.metricCardFull]}>
            <View style={styles.cardTopRow}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <View
                  style={[
                    styles.metricIconWrap,
                    { backgroundColor: "#ecfdf5", marginBottom: 0 },
                  ]}
                >
                  <Feather name="mail" size={19} color="#059669" />
                </View>
                <View>
                  <Text style={[styles.metricTitle, { marginBottom: 1 }]}>
                    Brevo Mail Engine
                  </Text>
                  <Text style={styles.footerText} numberOfLines={1}>
                    SMTP v3 • {b?.accountEmail || "Dispatcher Active"}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusPill, { backgroundColor: "#ecfdf5" }]}>
                <Text style={[styles.statusPillText, { color: "#059669" }]}>
                  {b?.status === "healthy"
                    ? "Active"
                    : b?.status === "unconfigured"
                    ? "Setup"
                    : "Ready"}
                </Text>
              </View>
            </View>

            {isDiagnosticsLoading ? (
              <ActivityIndicator
                size="small"
                color="#059669"
                style={styles.loader}
              />
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginTop: 8,
                  }}
                >
                  <Text style={styles.statMainValue}>
                    {b?.creditsRemaining ?? 300}{" "}
                    <Text style={styles.statUnit}>credits left</Text>
                  </Text>
                  <Text style={styles.statSubText} numberOfLines={1}>
                    {b?.dailyCreditLimit ?? 300}/day ({b?.planType || "Free"})
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarTrack, { marginVertical: 6 }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.max(4, b?.creditsPercentUsed ?? 0),
                        )}%`,
                        backgroundColor:
                          (b?.creditsPercentUsed ?? 0) > 90
                            ? "#ef4444"
                            : (b?.creditsPercentUsed ?? 0) > 75
                            ? "#f59e0b"
                            : "#059669",
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.footerText} numberOfLines={1}>
                    Relay Status: {b?.relayStatus || "Standard"} • Quota resets
                    daily
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── 4. Server Hardware & Memory Diagnostics ── */}
        <Text style={styles.sectionLabel}>SERVER RUNTIME & MEMORY</Text>
        <View style={styles.runtimeCard}>
          {/* Row 1: Container RAM (RSS) */}
          <View style={styles.runtimeRow}>
            <View style={styles.runtimeLeft}>
              <View
                style={[styles.smallIconWrap, { backgroundColor: "#eff6ff" }]}
              >
                <Feather name="cpu" size={16} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.runtimeTitle}>Server Container RAM</Text>
                <Text style={styles.runtimeSubtitle}>
                  {runtime?.memory?.rssFormatted || "--"} used of{" "}
                  {runtime?.memory?.containerLimitFormatted || "512 MB"} limit
                  (Headroom: {runtime?.memory?.headroomFormatted || "--"})
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.runtimeBadge,
                {
                  color:
                    (runtime?.memory?.percentContainerRam ?? 0) > 85
                      ? "#ef4444"
                      : (runtime?.memory?.percentContainerRam ?? 0) > 70
                      ? "#f59e0b"
                      : "#10b981",
                },
              ]}
            >
              {runtime?.memory?.percentContainerRam ?? 0}%
            </Text>
          </View>

          {/* Container RAM Progress Bar */}
          <View style={[styles.progressBarTrack, { marginVertical: 10 }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(
                    100,
                    Math.max(4, runtime?.memory?.percentContainerRam ?? 0),
                  )}%`,
                  backgroundColor:
                    (runtime?.memory?.percentContainerRam ?? 0) > 85
                      ? "#ef4444"
                      : (runtime?.memory?.percentContainerRam ?? 0) > 70
                      ? "#f59e0b"
                      : "#10b981",
                },
              ]}
            />
          </View>

          {/* V8 Heap Detail row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 11, color: "#64748b" }}>
              Active V8 Heap: {runtime?.memory?.heapUsedFormatted || "--"} of{" "}
              {runtime?.memory?.heapTotalFormatted || "--"} allocated
            </Text>
            <Text
              style={{
                fontSize: 11,
                color:
                  (runtime?.memory?.percentContainerRam ?? 0) <= 70
                    ? "#10b981"
                    : "#f59e0b",
                fontWeight: "600",
              }}
            >
              {(runtime?.memory?.percentContainerRam ?? 0) <= 70
                ? "Healthy Capacity"
                : "High Memory"}
            </Text>
          </View>

          <View style={styles.runtimeDivider} />

          {/* Row 2: Environment Details */}
          <View style={styles.runtimeDetailGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>PLATFORM</Text>
              <Text style={styles.detailValue}>
                {runtime ? `${runtime.platform} (${runtime.arch})` : "--"}
              </Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>SERVER UPTIME</Text>
              <Text style={styles.detailValue}>
                {runtime?.uptimeFormatted || "--"}
              </Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>DB TABLES</Text>
              <Text style={styles.detailValue}>
                {db?.totalTables ?? "--"} public tables
              </Text>
            </View>
          </View>
        </View>

        {/* ── 5. Security & Data Maintenance Section ── */}
        <Text style={styles.sectionLabel}>SECURITY & DATA MAINTENANCE</Text>
        <View style={styles.maintenanceCard}>
          <View style={styles.maintenanceHeaderRow}>
            <View style={styles.cleanIconWrap}>
              <Feather name="trash-2" size={22} color="#131b2e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.maintenanceTitle}>
                Stale Data & Session Purge
              </Text>
              <Text style={styles.maintenanceDesc}>
                Cleans up unverified abandoned accounts (&gt;24h), expired OTP
                verification tokens, and invalid sessions.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.runCleanupBtn,
              cleanupMutation.isPending && styles.btnDisabled,
            ]}
            onPress={handleRunCleanup}
            disabled={cleanupMutation.isPending}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Run Security Cleanup Now"
          >
            {cleanupMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="play" size={16} color="#ffffff" />
                <Text style={styles.runCleanupBtnText}>
                  Run Security Cleanup Now
                </Text>
              </>
            )}
          </TouchableOpacity>

          {lastCleanupResult && (
            <View style={styles.cleanupResultBox}>
              <Text style={styles.resultTitle}>Last Cleanup Results:</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>
                  • Abandoned Unverified Users Purged:
                </Text>
                <Text style={styles.resultVal}>
                  {lastCleanupResult.unverifiedUsersDeleted}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>
                  • Expired Verification OTPs Purged:
                </Text>
                <Text style={styles.resultVal}>
                  {lastCleanupResult.expiredVerificationsDeleted}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>• Expired Sessions Purged:</Text>
                <Text style={styles.resultVal}>
                  {lastCleanupResult.expiredSessionsDeleted}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  refreshIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  statusHeroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pulsingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  latencyWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  latencyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  envPill: {
    backgroundColor: "#f5f3ff",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd6fe",
  },
  envPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7c3aed",
    letterSpacing: 0.5,
  },
  heroDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 14,
  },
  serviceMatrixBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 14,
  },
  serviceMatrixItem: {
    flex: 1,
    alignItems: "center",
  },
  matrixDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  matrixLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 1,
  },
  matrixStatus: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  matrixDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e2e8f0",
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  inlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timestampText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  hostBadge: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hostBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  nodeBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nodeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  logsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  liveStreamBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 5,
  },
  liveStreamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  liveStreamText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5,
  },
  terminalCard: {
    backgroundColor: "#0b1120",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    marginBottom: 4,
    ...shadows.level1,
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  terminalDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  termDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  terminalTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  terminalCount: {
    fontSize: 10.5,
    color: "#64748b",
    fontWeight: "600",
  },
  terminalBody: {
    padding: 12,
    maxHeight: 280,
  },
  terminalLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  terminalLoadingText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  terminalEmptyText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 16,
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  logRow: {
    marginBottom: 9,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#131d31",
  },
  logMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  logLevelBadge: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  logServiceTag: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94a3b8",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  logTimestamp: {
    fontSize: 10,
    color: "#475569",
    marginLeft: "auto",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  logMessage: {
    fontSize: 11.5,
    color: "#e2e8f0",
    lineHeight: 16,
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#64748b",
    marginBottom: 10,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
  },
  metricCardFull: {
    width: "100%",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  loader: {
    marginVertical: 14,
    alignSelf: "flex-start",
  },
  statMainValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  statSubText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBarTrack: {
    width: "100%",
    height: 5,
    borderRadius: 3,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
  },
  footerText: {
    fontSize: 10.5,
    color: "#94a3b8",
    fontWeight: "600",
  },
  runtimeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
    marginBottom: 24,
  },
  runtimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  runtimeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  smallIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  runtimeTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  runtimeSubtitle: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 2,
  },
  runtimeBadge: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3b82f6",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  runtimeDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  runtimeDetailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  maintenanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
  },
  maintenanceHeaderRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  cleanIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  maintenanceDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginTop: 2,
  },
  runCleanupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131b2e",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  runCleanupBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  cleanupResultBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  resultVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
});
