import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import axios from "axios";

import { api } from "@/services/api";
import { shadows } from "@/theme/layout";

// ─── Font Configuration ───────────────────────────────────────────────────────
const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const monoFont = Platform.select({
  ios: "Courier New",
  android: "monospace",
  default: "monospace",
});

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

type LogFilter = "ALL" | "DATABASE" | "API" | "STORAGE" | "EMAIL" | "AUTH";

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminSystemMonitorScreen() {
  const insets = useSafeAreaInsets();

  // Edge-to-edge translucent status bar on screen focus
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent", true);
        StatusBar.setTranslucent(true);
      }
    }, []),
  );

  const [lastCleanupResult, setLastCleanupResult] = useState<any>(null);
  const [selectedLogFilter, setSelectedLogFilter] = useState<LogFilter>("ALL");

  // Rotating animation for refresh icon
  const spinValue = useRef(new Animated.Value(0)).current;

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

  // 2. Comprehensive System Diagnostics Query
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

  const isRefreshing = isHealthFetching || isDiagnosticsFetching;

  // Trigger spin animation when refreshing
  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isRefreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
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

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (selectedLogFilter === "ALL") return logs;
    return logs.filter((item) => item.service === selectedLogFilter);
  }, [logs, selectedLogFilter]);

  // Bottom scroll padding accounting for the floating bottom navigation bar
  const bottomScrollPadding = Math.max(insets.bottom + 110, 130);

  return (
    <View style={styles.container}>
      {/* ── Top Header (Minimalist, Left-Aligned, Seamless BG) ── */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top + 8, 16) },
        ]}
      >
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>System Monitor</Text>
          <Text style={styles.headerSubtitle}>
            Server telemetry & cluster health
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={handleRefreshAll}
            disabled={isRefreshing}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Refresh system diagnostics"
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Feather
                name="refresh-cw"
                size={18}
                color={isRefreshing ? "#6366f1" : "#131b2e"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomScrollPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshAll}
            colors={["#131b2e"]}
            tintColor="#131b2e"
          />
        }
      >
        {/* ── 1. Production-Grade Cluster Hero Card ── */}
        <View style={styles.statusHeroCard}>
          {/* Top Row: Operational Status Badge + Latency Indicator */}
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.pulsingBadge,
                { backgroundColor: isOnline ? "#ecfdf5" : "#fef2f2" },
              ]}
            >
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
                numberOfLines={1}
              >
                {isOnline ? "ALL SYSTEMS OPERATIONAL" : "DEGRADED OR OFFLINE"}
              </Text>
            </View>

            <View style={styles.latencyWrap}>
              <Feather
                name="zap"
                size={12}
                color={latency > 500 ? "#f59e0b" : "#10b981"}
              />
              <Text style={styles.latencyText}>
                {latency > 0 ? `${latency} ms` : "Checking..."}
              </Text>
            </View>
          </View>

          {/* Engine Title + Environment Tag */}
          <View style={styles.titleRow}>
            <Text style={styles.heroTitle} numberOfLines={1}>
              UniCompanion Engine
            </Text>
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

          {/* Micro-Services Live Health 2x2 Grid (Prevents Overflow & Text Squishing) */}
          <View style={styles.serviceMatrixGrid}>
            {/* Gateway */}
            <View style={styles.serviceMatrixTile}>
              <View style={styles.matrixTileHeader}>
                <View style={[styles.matrixDot, { backgroundColor: "#10b981" }]} />
                <Text style={styles.matrixLabel} numberOfLines={1}>
                  API Gateway
                </Text>
              </View>
              <Text style={styles.matrixStatus} numberOfLines={1}>
                200 OK
              </Text>
            </View>

            {/* PostgreSQL */}
            <View style={styles.serviceMatrixTile}>
              <View style={styles.matrixTileHeader}>
                <View
                  style={[
                    styles.matrixDot,
                    {
                      backgroundColor:
                        db?.status === "healthy" ? "#10b981" : "#ef4444",
                    },
                  ]}
                />
                <Text style={styles.matrixLabel} numberOfLines={1}>
                  PostgreSQL
                </Text>
              </View>
              <Text style={styles.matrixStatus} numberOfLines={1}>
                {db?.latencyMs ? `${db.latencyMs}ms` : "Pool Active"}
              </Text>
            </View>

            {/* Cloudinary */}
            <View style={styles.serviceMatrixTile}>
              <View style={styles.matrixTileHeader}>
                <View
                  style={[
                    styles.matrixDot,
                    {
                      backgroundColor:
                        c?.status === "healthy" ? "#10b981" : "#f59e0b",
                    },
                  ]}
                />
                <Text style={styles.matrixLabel} numberOfLines={1}>
                  Cloudinary
                </Text>
              </View>
              <Text style={styles.matrixStatus} numberOfLines={1}>
                {c?.objectsCount ?? 0} Assets
              </Text>
            </View>

            {/* Brevo SMTP */}
            <View style={styles.serviceMatrixTile}>
              <View style={styles.matrixTileHeader}>
                <View
                  style={[
                    styles.matrixDot,
                    {
                      backgroundColor:
                        b?.status === "healthy" ? "#10b981" : "#f59e0b",
                    },
                  ]}
                />
                <Text style={styles.matrixLabel} numberOfLines={1}>
                  Brevo SMTP
                </Text>
              </View>
              <Text style={styles.matrixStatus} numberOfLines={1}>
                {b?.creditsRemaining ?? 300} left
              </Text>
            </View>
          </View>

          {/* Last Checked & Node Version in Same Row (No Hostname / Tanver) */}
          <View style={styles.timestampRow}>
            <View style={styles.inlineInfo}>
              <Feather name="clock" size={12} color="#94a3b8" />
              <Text style={styles.timestampText} numberOfLines={1}>
                Last checked:{" "}
                {diagnostics?.timestamp
                  ? new Date(diagnostics.timestamp).toLocaleTimeString()
                  : "Just now"}
              </Text>
            </View>

            {runtime && (
              <View style={styles.nodeBadge}>
                <Text style={styles.nodeBadgeText} numberOfLines={1}>
                  Node {runtime.nodeVersion}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 2. Live System Observability & Telemetry Console ── */}
        <View style={styles.logsSectionHeader}>
          <Text style={styles.logsSectionLabel} numberOfLines={1}>
            SYSTEM OBSERVABILITY
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
              <Text style={styles.terminalTitle}>engine.diagnostics.log</Text>
            </View>

            <View style={styles.terminalHeaderRight}>
              <View style={styles.terminalCountBadge}>
                <Text style={styles.terminalCountText}>
                  {logs.length} events
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Filter Strip */}
          <View style={styles.logFiltersStrip}>
            {(["ALL", "DATABASE", "API", "STORAGE", "EMAIL", "AUTH"] as LogFilter[]).map(
              (filterKey) => {
                const isActive = selectedLogFilter === filterKey;
                return (
                  <TouchableOpacity
                    key={filterKey}
                    style={[
                      styles.logFilterChip,
                      isActive && styles.logFilterChipActive,
                    ]}
                    onPress={() => setSelectedLogFilter(filterKey)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.logFilterText,
                        isActive && styles.logFilterTextActive,
                      ]}
                    >
                      {filterKey}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* Terminal Log Stream: Scrollable View with nestedScrollEnabled */}
          <ScrollView
            style={styles.terminalScroll}
            contentContainerStyle={styles.terminalScrollContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            indicatorStyle="white"
          >
            {isDiagnosticsLoading ? (
              <View style={styles.terminalLoading}>
                <ActivityIndicator size="small" color="#10b981" />
                <Text style={styles.terminalLoadingText}>
                  Streaming cluster telemetry...
                </Text>
              </View>
            ) : filteredLogs.length === 0 ? (
              <Text style={styles.terminalEmptyText}>
                No log events matching filter "{selectedLogFilter}".
              </Text>
            ) : (
              filteredLogs.map((log) => {
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
          </ScrollView>

          {/* Terminal Footer Indicator */}
          <View style={styles.terminalFooterBar}>
            <Text style={styles.terminalFooterText}>
              Showing {filteredLogs.length} of {logs.length} events • Scroll inside console to inspect full logs
            </Text>
          </View>
        </View>

        {/* ── 3. Infrastructure Storage & Quotas (Full Width, Zero Truncation) ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          INFRASTRUCTURE STORAGE & QUOTAS
        </Text>

        <View style={styles.metricGrid}>
          {/* Card 1: PostgreSQL DB (Full Bento Card) */}
          <View style={styles.bentoMetricCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[styles.metricIconWrap, { backgroundColor: "#eff6ff" }]}
                >
                  <Feather name="database" size={18} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.metricCardTitle}>PostgreSQL Database</Text>
                  <Text style={styles.metricCardSubtitle}>
                    Prisma Connection Pool
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      db?.status === "healthy" ? "#eff6ff" : "#fef2f2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color: db?.status === "healthy" ? "#2563eb" : "#ef4444",
                    },
                  ]}
                >
                  {db?.status === "healthy"
                    ? "Connected"
                    : db?.status === "degraded"
                    ? "High Load"
                    : "Error"}
                </Text>
              </View>
            </View>

            {isDiagnosticsLoading ? (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={styles.loader}
              />
            ) : (
              <>
                <View style={styles.statMetricRow}>
                  <Text style={styles.statMainValue}>
                    {db?.usedFormatted || "0 B"}
                  </Text>
                  <Text style={styles.statLimitLabel}>
                    Limit: {db?.limitFormatted || "512 MB"}
                  </Text>
                </View>

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

                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardMetaLeft}>
                    {db?.remainingFormatted || "N/A"} available (
                    {db?.percentUsed != null
                      ? (100 - db.percentUsed).toFixed(1)
                      : "100"}
                    % free)
                  </Text>
                  <Text style={styles.cardMetaRight}>
                    {db?.activeConnections ?? 1} active conns •{" "}
                    {db?.totalTables ?? "--"} tables
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Card 2: Cloudinary Media Storage */}
          <View style={styles.bentoMetricCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[styles.metricIconWrap, { backgroundColor: "#fff7ed" }]}
                >
                  <Feather name="image" size={18} color="#ea580c" />
                </View>
                <View>
                  <Text style={styles.metricCardTitle}>Cloudinary Media CDN</Text>
                  <Text style={styles.metricCardSubtitle}>
                    Assets & Image Pipeline
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      c?.status === "healthy" ? "#fff7ed" : "#fef2f2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color: c?.status === "healthy" ? "#ea580c" : "#ef4444",
                    },
                  ]}
                >
                  {c?.status === "healthy"
                    ? "Linked"
                    : c?.status === "unconfigured"
                    ? "Setup"
                    : "Active"}
                </Text>
              </View>
            </View>

            {isDiagnosticsLoading ? (
              <ActivityIndicator
                size="small"
                color="#ea580c"
                style={styles.loader}
              />
            ) : (
              <>
                <View style={styles.statMetricRow}>
                  <Text style={styles.statMainValue}>
                    {c?.storageUsedFormatted || "0 B"}
                  </Text>
                  <Text style={styles.statLimitLabel}>
                    {c?.objectsCount ?? 0} Assets Stored
                  </Text>
                </View>

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

                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardMetaLeft}>
                    {c?.creditsRemaining ?? 25} credits left of{" "}
                    {c?.creditsLimit ?? 25}
                  </Text>
                  <Text style={styles.cardMetaRight}>
                    Plan: {c?.plan || "Free Tier"} • Auto CDN
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Card 3: Brevo Mail Engine */}
          <View style={styles.bentoMetricCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[styles.metricIconWrap, { backgroundColor: "#ecfdf5" }]}
                >
                  <Feather name="mail" size={18} color="#059669" />
                </View>
                <View>
                  <Text style={styles.metricCardTitle}>Brevo Mail Engine</Text>
                  <Text style={styles.metricCardSubtitle}>
                    SMTP v3 • {b?.accountEmail || "Dispatcher Active"}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      b?.status === "healthy" ? "#ecfdf5" : "#fef2f2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color: b?.status === "healthy" ? "#059669" : "#ef4444",
                    },
                  ]}
                >
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
                <View style={styles.statMetricRow}>
                  <Text style={styles.statMainValue}>
                    {b?.creditsRemaining ?? 300}{" "}
                    <Text style={styles.statUnit}>credits remaining</Text>
                  </Text>
                  <Text style={styles.statLimitLabel}>
                    {b?.dailyCreditLimit ?? 300}/day ({b?.planType || "Free"})
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarTrack}>
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

                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardMetaLeft}>
                    Relay Status: {b?.relayStatus || "Standard"}
                  </Text>
                  <Text style={styles.cardMetaRight}>Quota resets daily</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── 4. Server Hardware & Memory Diagnostics (Overlap Bug Fixed) ── */}
        <Text style={styles.sectionLabel}>SERVER RUNTIME & MEMORY</Text>
        <View style={styles.runtimeCard}>
          {/* Row 1: Container RAM (RSS) */}
          <View style={styles.runtimeHeaderRow}>
            <View style={styles.runtimeLeftGroup}>
              <View
                style={[styles.smallIconWrap, { backgroundColor: "#eff6ff" }]}
              >
                <Feather name="cpu" size={17} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.runtimeTitle}>Server Container RAM</Text>
                <Text style={styles.runtimeSubtitle}>
                  {runtime?.memory?.rssFormatted || "--"} used of{" "}
                  {runtime?.memory?.containerLimitFormatted || "512 MB"} limit
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.runtimePercentageBadge,
                {
                  backgroundColor:
                    (runtime?.memory?.percentContainerRam ?? 0) > 85
                      ? "#fef2f2"
                      : (runtime?.memory?.percentContainerRam ?? 0) > 70
                      ? "#fffbeb"
                      : "#ecfdf5",
                },
              ]}
            >
              <Text
                style={[
                  styles.runtimeBadgeText,
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
          </View>

          {/* Container RAM Progress Bar */}
          <View style={[styles.progressBarTrack, { marginVertical: 12 }]}>
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

          {/* V8 Heap Detail row with Guaranteed Spacing (Zero Overlap) */}
          <View style={styles.v8HeapRow}>
            <Text style={styles.v8HeapText} numberOfLines={1}>
              Active V8 Heap: {runtime?.memory?.heapUsedFormatted || "--"} of{" "}
              {runtime?.memory?.heapTotalFormatted || "--"} allocated
            </Text>

            <View
              style={[
                styles.capacityTag,
                {
                  backgroundColor:
                    (runtime?.memory?.percentContainerRam ?? 0) <= 70
                      ? "#ecfdf5"
                      : "#fffbeb",
                },
              ]}
            >
              <Text
                style={[
                  styles.capacityTagText,
                  {
                    color:
                      (runtime?.memory?.percentContainerRam ?? 0) <= 70
                        ? "#059669"
                        : "#d97706",
                  },
                ]}
              >
                {(runtime?.memory?.percentContainerRam ?? 0) <= 70
                  ? "Healthy Capacity"
                  : "High Memory"}
              </Text>
            </View>
          </View>

          <View style={styles.runtimeDivider} />

          {/* Row 2: Environment Details Grid */}
          <View style={styles.runtimeDetailGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>PLATFORM</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {runtime ? `${runtime.platform} (${runtime.arch})` : "--"}
              </Text>
            </View>

            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>SERVER UPTIME</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {runtime?.uptimeFormatted || "--"}
              </Text>
            </View>

            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>DB TABLES</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {db?.totalTables ?? "--"} public tables
              </Text>
            </View>
          </View>
        </View>

        {/* ── 5. Security & Data Maintenance ── */}
        <Text style={styles.sectionLabel}>SECURITY & DATA MAINTENANCE</Text>
        <View style={styles.maintenanceCard}>
          <View style={styles.maintenanceHeaderRow}>
            <View style={styles.cleanIconWrap}>
              <Feather name="shield" size={20} color="#131b2e" />
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
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Run Security Cleanup Now"
          >
            {cleanupMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="play" size={15} color="#ffffff" />
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
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#f7f9fb",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Hero Card ──
  statusHeroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
    marginBottom: 22,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  pulsingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    flexShrink: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
    flexShrink: 0,
  },
  statusText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  latencyWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexShrink: 0,
  },
  latencyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    fontFamily: monoFont,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
    flexWrap: "wrap",
  },
  heroTitle: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  envPill: {
    backgroundColor: "#f5f3ff",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd6fe",
  },
  envPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#7c3aed",
    letterSpacing: 0.5,
  },
  heroDesc: {
    fontFamily,
    fontSize: 12.5,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 14,
  },
  serviceMatrixGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  serviceMatrixTile: {
    width: "48.5%",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  matrixTileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  matrixDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  matrixLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    flex: 1,
  },
  matrixStatus: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: monoFont,
    paddingLeft: 11,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    gap: 8,
  },
  inlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  timestampText: {
    fontFamily,
    fontSize: 11.5,
    color: "#94a3b8",
  },
  nodeBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  nodeBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
    fontFamily: monoFont,
  },

  // ── Telemetry Logs ──
  logsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  logsSectionLabel: {
    flex: 1,
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#64748b",
  },
  liveStreamBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 5,
    flexShrink: 0,
  },
  liveStreamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  liveStreamText: {
    fontFamily,
    fontSize: 9.5,
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
    paddingHorizontal: 12,
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalTitle: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#94a3b8",
    fontFamily: monoFont,
    marginLeft: 4,
  },
  terminalHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  terminalCountBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  terminalCountText: {
    fontSize: 10,
    color: "#94a3b8",
    fontFamily: monoFont,
  },
  logFiltersStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#0d1527",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    gap: 6,
    flexWrap: "wrap",
  },
  logFilterChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "#17233a",
  },
  logFilterChipActive: {
    backgroundColor: "#2563eb",
  },
  logFilterText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.3,
  },
  logFilterTextActive: {
    color: "#ffffff",
  },
  terminalScroll: {
    height: 270,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  terminalScrollContent: {
    paddingBottom: 8,
  },
  terminalLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  terminalLoadingText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: monoFont,
  },
  terminalEmptyText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 24,
    fontFamily: monoFont,
  },
  logRow: {
    marginBottom: 8,
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
    fontSize: 10.5,
    fontWeight: "800",
    fontFamily: monoFont,
  },
  logServiceTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    fontFamily: monoFont,
  },
  logTimestamp: {
    fontSize: 9.5,
    color: "#475569",
    marginLeft: "auto",
    fontFamily: monoFont,
  },
  logMessage: {
    fontSize: 11,
    color: "#e2e8f0",
    lineHeight: 16,
    fontFamily: monoFont,
  },
  terminalFooterBar: {
    backgroundColor: "#0d1527",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  terminalFooterText: {
    fontSize: 9.5,
    color: "#64748b",
    fontFamily: monoFont,
  },

  // ── Metric Bento Cards ──
  sectionLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#64748b",
    marginBottom: 10,
  },
  metricGrid: {
    gap: 12,
    marginBottom: 24,
  },
  bentoMetricCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  metricCardTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricCardSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  loader: {
    marginVertical: 14,
    alignSelf: "flex-start",
  },
  statMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  statMainValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  statLimitLabel: {
    fontFamily,
    fontSize: 11.5,
    color: "#64748b",
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
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    flexWrap: "wrap",
    gap: 4,
  },
  cardMetaLeft: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  cardMetaRight: {
    fontFamily,
    fontSize: 10.5,
    color: "#94a3b8",
    fontWeight: "600",
  },

  // ── Runtime & Hardware Card ──
  runtimeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
    marginBottom: 24,
  },
  runtimeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  runtimeLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  smallIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  runtimeTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  runtimeSubtitle: {
    fontFamily,
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 2,
  },
  runtimePercentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  runtimeBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: monoFont,
  },
  v8HeapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  v8HeapText: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    flexShrink: 1,
  },
  capacityTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  capacityTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  runtimeDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  runtimeDetailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  detailValue: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155",
  },

  // ── Maintenance Card ──
  maintenanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
  },
  maintenanceHeaderRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  cleanIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  maintenanceTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  maintenanceDesc: {
    fontFamily,
    fontSize: 12.5,
    color: "#64748b",
    lineHeight: 18,
    marginTop: 2,
  },
  runCleanupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131b2e",
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  runCleanupBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  cleanupResultBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resultTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  resultLabel: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
  },
  resultVal: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: monoFont,
  },
});

export default AdminSystemMonitorScreen;

