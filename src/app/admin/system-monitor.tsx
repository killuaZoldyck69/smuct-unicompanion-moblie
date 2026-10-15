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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import axios from "axios";

import { api } from "@/services/api";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing, rounded, shadows } from "@/theme/layout";

export default function AdminSystemMonitorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lastCleanupResult, setLastCleanupResult] = useState<any>(null);

  // --- Ping Health Query ---
  const {
    data: healthData,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
    refetch: refetchHealth,
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
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // --- Maintenance Cleanup Mutation ---
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
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Maintenance Failed",
        text2: err?.response?.data?.message || err.message,
      });
    },
  });

  const handleRunCleanup = () => {
    cleanupMutation.mutate(24);
  };

  const isOnline = healthData?.status === "ok";
  const latency = healthData?.latencyMs ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#131b2e" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>System Monitor</Text>
          <Text style={styles.headerSubtitle}>Server Health & Diagnostics</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={() => refetchHealth()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="refresh-cw" size={18} color="#131b2e" />
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
            refreshing={isHealthFetching}
            onRefresh={() => refetchHealth()}
            colors={["#131b2e"]}
          />
        }
      >
        {/* ── Status Card ── */}
        <View style={styles.statusHeroCard}>
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
            <Text style={styles.latencyText}>
              {latency > 0 ? `${latency} ms` : "Checking..."}
            </Text>
          </View>

          <Text style={styles.heroTitle}>UniCompanion Engine</Text>
          <Text style={styles.heroDesc}>
            {healthData?.message || "Validating connection to SMUCT backend node..."}
          </Text>

          <View style={styles.timestampRow}>
            <Feather name="clock" size={12} color="#94a3b8" />
            <Text style={styles.timestampText}>
              Last checked:{" "}
              {healthData?.timestamp
                ? new Date(healthData.timestamp).toLocaleTimeString()
                : "Just now"}
            </Text>
          </View>
        </View>

        {/* ── Metrics Grid ── */}
        <Text style={styles.sectionLabel}>INFRASTRUCTURE METRICS</Text>
        <View style={styles.metricGrid}>
          {/* PostgreSQL */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#eff6ff" }]}>
              <Feather name="database" size={20} color="#2563eb" />
            </View>
            <Text style={styles.metricValue}>Connected</Text>
            <Text style={styles.metricTitle}>PostgreSQL DB</Text>
            <Text style={styles.metricSub}>Prisma ORM Active</Text>
          </View>

          {/* Better Auth */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#f5f3ff" }]}>
              <Feather name="shield" size={20} color="#7c3aed" />
            </View>
            <Text style={styles.metricValue}>Guarded</Text>
            <Text style={styles.metricTitle}>Better Auth</Text>
            <Text style={styles.metricSub}>Role RBAC & OTP</Text>
          </View>

          {/* Brevo Email SMTP */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#ecfdf5" }]}>
              <Feather name="mail" size={20} color="#059669" />
            </View>
            <Text style={styles.metricValue}>Configured</Text>
            <Text style={styles.metricTitle}>Brevo Engine</Text>
            <Text style={styles.metricSub}>SMTP v3 Dispatcher</Text>
          </View>

          {/* Cloudinary CDN */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#fff7ed" }]}>
              <Feather name="image" size={20} color="#ea580c" />
            </View>
            <Text style={styles.metricValue}>Linked</Text>
            <Text style={styles.metricTitle}>Cloudinary</Text>
            <Text style={styles.metricSub}>Media Storage</Text>
          </View>
        </View>

        {/* ── Security Maintenance Section ── */}
        <Text style={styles.sectionLabel}>SECURITY & DATA MAINTENANCE</Text>
        <View style={styles.maintenanceCard}>
          <View style={styles.maintenanceHeaderRow}>
            <View style={styles.cleanIconWrap}>
              <Feather name="trash-2" size={22} color="#131b2e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.maintenanceTitle}>Stale Data & Session Purge</Text>
              <Text style={styles.maintenanceDesc}>
                Cleans up unverified abandoned accounts (&gt;24h), expired OTP verification tokens, and invalid sessions.
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
          >
            {cleanupMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="play" size={16} color="#ffffff" />
                <Text style={styles.runCleanupBtnText}>Run Security Cleanup Now</Text>
              </>
            )}
          </TouchableOpacity>

          {lastCleanupResult && (
            <View style={styles.cleanupResultBox}>
              <Text style={styles.resultTitle}>Last Cleanup Results:</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>• Abandoned Unverified Users Purged:</Text>
                <Text style={styles.resultVal}>{lastCleanupResult.unverifiedUsersDeleted}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>• Expired Verification OTPs Purged:</Text>
                <Text style={styles.resultVal}>{lastCleanupResult.expiredVerificationsDeleted}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>• Expired Sessions Purged:</Text>
                <Text style={styles.resultVal}>{lastCleanupResult.expiredSessionsDeleted}</Text>
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
    marginBottom: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
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
  latencyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    fontFamily: Platform.select({ ios: "Courier", default: "monospace" }),
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 16,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  timestampText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#64748b",
    marginBottom: 12,
    marginTop: 8,
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...shadows.level1,
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
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
    marginTop: 4,
  },
  runCleanupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131b2e",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  runCleanupBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  cleanupResultBox: {
    marginTop: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resultTitle: {
    fontSize: 13,
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
    color: "#475569",
  },
  resultVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },
});
