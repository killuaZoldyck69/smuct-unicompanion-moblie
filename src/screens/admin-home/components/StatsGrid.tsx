import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminDashboardStats } from "../hooks/use-admin-dashboard";

interface StatsGridProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  iconNode: React.ReactNode;
  watermarkNode: React.ReactNode;
  value: string | number;
  label: string;
  cardBg: string;
  borderColor: string;
  iconBg: string;
  onPress?: () => void;
  isLoading: boolean;
}

const StatCard = React.memo(function StatCard({
  iconNode,
  watermarkNode,
  value,
  label,
  cardBg,
  borderColor,
  iconBg,
  onPress,
  isLoading,
}: StatCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
      onPress={onPress}
      activeOpacity={0.75}
      accessible={!!onPress}
      accessibilityRole={onPress ? "button" : "none"}
      accessibilityLabel={`${label}: ${value}`}
    >
      {/* Background Watermark Icon */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        {watermarkNode}
      </View>

      {/* Top Row: Icon Box + Chevron */}
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          {iconNode}
        </View>
        <Feather name="chevron-right" size={16} color="#94A3B8" />
      </View>

      {/* Bottom Content: Number + Label */}
      <View style={styles.bottomBlock}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#64748B" style={styles.loader} />
        ) : (
          <Text style={styles.value} numberOfLines={1}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
        )}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Container>
  );
});

export const StatsGrid = React.memo(function StatsGrid({
  stats,
  isLoading,
}: StatsGridProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>LIVE OVERVIEW</Text>

      {/* Row 1: Students & Teachers */}
      <View style={styles.row}>
        {/* 1. Total Students */}
        <StatCard
          iconNode={<Feather name="user" size={18} color="#10B981" />}
          watermarkNode={
            <MaterialCommunityIcons
              name="account-group-outline"
              size={76}
              color="#10B981"
            />
          }
          value={stats?.totalStudents ?? 0}
          label="Total Students"
          cardBg="#F0FDF8"
          borderColor="#D1FAE5"
          iconBg="#DCFCE7"
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/admin_users")}
        />

        {/* 2. Total Teachers */}
        <StatCard
          iconNode={
            <MaterialCommunityIcons
              name="human-male-board"
              size={19}
              color="#6366F1"
            />
          }
          watermarkNode={
            <MaterialCommunityIcons
              name="human-male-board"
              size={76}
              color="#6366F1"
            />
          }
          value={stats?.totalTeachers ?? 0}
          label="Total Teachers"
          cardBg="#F8FAFF"
          borderColor="#E0E7FF"
          iconBg="#EEF2FF"
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/admin_users")}
        />
      </View>

      {/* Row 2: Restricted & Published Notices */}
      <View style={styles.row}>
        {/* 3. Restricted Users */}
        <StatCard
          iconNode={<Feather name="slash" size={17} color="#EF4444" />}
          watermarkNode={
            <Ionicons name="lock-closed-outline" size={74} color="#EF4444" />
          }
          value={stats?.restrictedUsers ?? 0}
          label="Restricted Users"
          cardBg="#FFF8F8"
          borderColor="#FEE2E2"
          iconBg="#FEE2E2"
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/admin_users")}
        />

        {/* 4. Total Course Hubs */}
        <StatCard
          iconNode={<Feather name="book-open" size={18} color="#D97706" />}
          watermarkNode={
            <Ionicons name="book-outline" size={74} color="#D97706" />
          }
          value={stats?.totalCourseHubs ?? 0}
          label="Total Course Hubs"
          cardBg="#FFFDF5"
          borderColor="#FEF3C7"
          iconBg="#FEF3C7"
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/hubs")}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8E9BAE",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
  },
  watermarkContainer: {
    position: "absolute",
    right: -10,
    bottom: -12,
    opacity: 0.12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBlock: {
    marginTop: "auto",
  },
  loader: {
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  value: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
});
