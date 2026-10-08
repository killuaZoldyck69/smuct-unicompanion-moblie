// src/screens/notices/components/notice-states.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";

export const NoticeSkeleton = React.memo(function NoticeSkeleton() {
  return (
    <View style={styles.stateContainer}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.skeletonCard}>
          <View style={styles.skeletonAccentBar} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={[styles.skeletonTitle, { width: "65%" }]} />
            <View style={styles.skeletonRef} />
            <View style={styles.skeletonDivider} />
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonCatBadge} />
              <View style={styles.skeletonDatePill} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});

interface NoticeErrorStateProps {
  onRetry: () => void;
}

export const NoticeErrorState = React.memo(function NoticeErrorState({
  onRetry,
}: NoticeErrorStateProps) {
  return (
    <View style={styles.errorCard}>
      <View style={styles.errorIconCircle}>
        <Feather name="alert-circle" size={30} color="#dc2626" />
      </View>
      <Text style={styles.errorTitle}>Unable to load notices</Text>
      <Text style={styles.errorDesc}>
        Could not connect to the campus server. Please verify your connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Retry loading notices"
      >
        <Feather
          name="refresh-cw"
          size={14}
          color={NOTICE_COLORS.white}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.retryButtonText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );
});

interface NoticeEmptyStateProps {
  searchQuery: string;
  selectedCategory: string;
  onReset: () => void;
}

export const NoticeEmptyState = React.memo(function NoticeEmptyState({
  searchQuery,
  selectedCategory,
  onReset,
}: NoticeEmptyStateProps) {
  const isFiltered = selectedCategory !== "ALL" || searchQuery.trim().length > 0;

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconCircle}>
        <Feather name="file-text" size={32} color={NOTICE_COLORS.subtleText} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery.trim()
          ? "No matching notices"
          : selectedCategory !== "ALL"
            ? `No ${selectedCategory.toLowerCase()} notices`
            : "No notices available"}
      </Text>
      <Text style={styles.emptyDesc}>
        {searchQuery.trim()
          ? `No notices matched "${searchQuery}". Try a different keyword.`
          : "There are currently no circulars or announcements posted in this section."}
      </Text>
      {isFiltered && (
        <TouchableOpacity
          style={styles.emptyActionBtn}
          onPress={onReset}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Reset notice filters"
        >
          <Text style={styles.emptyActionBtnText}>View All Notices</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  stateContainer: {
    paddingHorizontal: 20,
    gap: 14,
  },
  skeletonCard: {
    backgroundColor: NOTICE_COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    overflow: "hidden",
    position: "relative",
    ...NOTICE_COLORS.shadow,
  },
  skeletonAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: "#e2e8f0",
  },
  skeletonContent: {
    paddingLeft: 18,
    paddingRight: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  skeletonDatePill: {
    width: 80,
    height: 18,
    borderRadius: 5,
    backgroundColor: "#f1f5f9",
  },
  skeletonCatBadge: {
    width: 75,
    height: 18,
    borderRadius: 5,
    backgroundColor: "#f1f5f9",
  },
  skeletonTitle: {
    height: 18,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  skeletonRef: {
    width: "45%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 10,
  },
  skeletonIssuerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f1f5f9",
    marginRight: 9,
  },
  skeletonIssuerName: {
    width: "50%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 4,
  },
  skeletonIssuerRole: {
    width: "35%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  errorCard: {
    backgroundColor: NOTICE_COLORS.white,
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.12)",
    ...NOTICE_COLORS.shadow,
  },
  errorIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  errorTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    marginBottom: 6,
  },
  errorDesc: {
    fontFamily,
    fontSize: 13,
    color: NOTICE_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.deepNavy,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: NOTICE_COLORS.pillRadius,
  },
  retryButtonText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: NOTICE_COLORS.white,
  },
  emptyCard: {
    backgroundColor: NOTICE_COLORS.white,
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    ...NOTICE_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily,
    fontSize: 13,
    color: NOTICE_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },
  emptyActionBtn: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: NOTICE_COLORS.pillRadius,
  },
  emptyActionBtnText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
  },
});
