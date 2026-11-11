import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { ActivityItem } from "../hooks/use-admin-dashboard";
import { FONT_FAMILIES } from "@/theme/typography";

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading: boolean;
}

const ACTIVITY_CONFIG: Record<
  ActivityItem["type"],
  { icon: keyof typeof Feather.glyphMap; iconBg: string; iconColor: string }
> = {
  USER_JOINED: { icon: "user-check", iconBg: "#ECFDF5", iconColor: "#059669" },
  USER_RESTRICTED: { icon: "slash", iconBg: "#FFF1F2", iconColor: "#E11D48" },
  TEACHER_ADDED: { icon: "award", iconBg: "#EEF2FF", iconColor: "#4F46E5" },
  NOTICE_POSTED: { icon: "bell", iconBg: "#FFF7ED", iconColor: "#EA580C" },
  COMPLAINT_FILED: { icon: "alert-circle", iconBg: "#FFFBEB", iconColor: "#D97706" },
  MAINTENANCE_RUN: { icon: "tool", iconBg: "#F8FAFC", iconColor: "#64748B" },
};

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ActivityRow = React.memo(function ActivityRow({
  item,
  isLast,
}: {
  item: ActivityItem;
  isLast: boolean;
}) {
  const config = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.MAINTENANCE_RUN;

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
        <Feather name={config.icon} size={16} color={config.iconColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Text style={styles.timeLabel}>
        {formatRelativeTime(item.timestamp)}
      </Text>
    </View>
  );
});

export const ActivityFeed = React.memo(function ActivityFeed({
  items,
  isLoading,
}: ActivityFeedProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>

      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading activity...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="file-tray-outline" size={24} color="#8E9BAE" />
            </View>
            <Text style={styles.emptyTitle}>No recent activity</Text>
            <Text style={styles.emptySubtitle}>
              New events and audit logs will appear here automatically.
            </Text>

            {/* Bottom Decorative Wave */}
            <View style={styles.waveWrapper} pointerEvents="none">
              <Svg
                width="100%"
                height="32"
                viewBox="0 0 320 32"
                preserveAspectRatio="none"
              >
                <Path
                  d="M0,24 C70,24 110,6 180,16 C230,23 270,7 320,10"
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                  fill="none"
                  opacity={0.7}
                />
              </Svg>
            </View>
          </View>
        ) : (
          items.map((item, index) => (
            <ActivityRow
              key={item.id}
              item={item}
              isLast={index === items.length - 1}
            />
          ))
        )}
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
    color: "#64748B",
    letterSpacing: 0.85,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    position: "relative",
  },
  emptyContainer: {
    paddingTop: 34,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 15.5,
    lineHeight: 21,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },
  waveWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: FONT_FAMILIES.titleBold,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  rowSubtitle: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  timeLabel: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 11,
    lineHeight: 15,
    color: "#64748B",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    flexShrink: 0,
  },
});
