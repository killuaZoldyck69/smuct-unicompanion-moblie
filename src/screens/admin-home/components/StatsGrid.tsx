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
import { FONT_FAMILIES } from "@/theme/typography";
import { colors } from "@/theme/colors";

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
        <Feather name="chevron-right" size={16} color={colors.slate400} />
      </View>

      {/* Bottom Content: Number + Label */}
      <View style={styles.bottomBlock}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.slate500}
            style={styles.loader}
          />
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
          iconNode={
            <Feather name="user" size={18} color={colors.semantic.emerald.solid} />
          }
          watermarkNode={
            <MaterialCommunityIcons
              name="account-group-outline"
              size={76}
              color={colors.semantic.emerald.solid}
            />
          }
          value={stats?.totalStudents ?? 0}
          label="Total Students"
          cardBg={colors.semantic.emerald.softSurface}
          borderColor={colors.semantic.emerald.border}
          iconBg={colors.semantic.emerald.soft}
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/admin_users")}
        />

        {/* 2. Total Teachers */}
        <StatCard
          iconNode={
            <MaterialCommunityIcons
              name="human-male-board"
              size={19}
              color={colors.semantic.indigo.soft}
            />
          }
          watermarkNode={
            <MaterialCommunityIcons
              name="human-male-board"
              size={76}
              color={colors.semantic.indigo.soft}
            />
          }
          value={stats?.totalTeachers ?? 0}
          label="Total Teachers"
          cardBg={colors.semantic.indigo.softSurface}
          borderColor={colors.semantic.indigo.border}
          iconBg={colors.semantic.indigo.tint}
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/admin_users")}
        />
      </View>

      {/* Row 2: Restricted & Course Hubs */}
      <View style={[styles.row, styles.rowLast]}>
        {/* 3. Restricted Users */}
        <StatCard
          iconNode={
            <Feather name="slash" size={17} color={colors.semantic.red.solid} />
          }
          watermarkNode={
            <Ionicons
              name="lock-closed-outline"
              size={74}
              color={colors.semantic.red.solid}
            />
          }
          value={stats?.restrictedUsers ?? 0}
          label="Restricted Users"
          cardBg={colors.semantic.red.softSurface}
          borderColor={colors.semantic.red.softBorder}
          iconBg={colors.semantic.red.softBorder}
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/admin_users")}
        />

        {/* 4. Total Course Hubs */}
        <StatCard
          iconNode={
            <Feather
              name="book-open"
              size={18}
              color={colors.semantic.amber.accent}
            />
          }
          watermarkNode={
            <Ionicons
              name="book-outline"
              size={74}
              color={colors.semantic.amber.accent}
            />
          }
          value={stats?.totalCourseHubs ?? 0}
          label="Total Course Hubs"
          cardBg={colors.semantic.amber.softSurface}
          borderColor={colors.semantic.amber.soft}
          iconBg={colors.semantic.amber.soft}
          isLoading={isLoading}
          onPress={() => router.push("/(tabs)/admin_course_hubs")}
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
    fontFamily: FONT_FAMILIES.bodyExtraBold,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "800",
    color: colors.slate500,
    letterSpacing: 0.85,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  rowLast: {
    marginBottom: 0,
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
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.navyInk,
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
    marginBottom: 3,
  },
  label: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "600",
    color: colors.slate500,
  },
});
