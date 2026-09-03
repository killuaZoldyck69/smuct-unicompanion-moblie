import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

export const NoticeSkeleton = React.memo(function NoticeSkeleton() {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 70 }]} />
        </View>
        <View style={styles.skeletonTitle} />
        <View style={[styles.skeletonTitle, { width: "70%" }]} />
        <View style={styles.skeletonRef} />
        <View style={styles.skeletonFooter} />
      </View>
      <View style={[styles.skeletonCard, { marginTop: 14 }]}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonPill} />
          <View style={[styles.skeletonPill, { width: 70 }]} />
        </View>
        <View style={styles.skeletonTitle} />
        <View style={[styles.skeletonTitle, { width: "60%" }]} />
        <View style={styles.skeletonRef} />
        <View style={styles.skeletonFooter} />
      </View>
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
        <Feather name="alert-circle" size={32} color="#ba1a1a" />
      </View>
      <Text style={styles.errorTitle}>Couldn't load notices</Text>
      <Text style={styles.errorDesc}>
        We were unable to retrieve official university announcements. Please check your connection.
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
          color={BENTO_COLORS.white}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.retryButtonText}>Try Again</Text>
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
        <Feather name="bell-off" size={36} color="#475569" />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery.trim()
          ? "No matching notices"
          : selectedCategory !== "ALL"
            ? `No ${selectedCategory.toLowerCase()} notices`
            : "No notices yet"}
      </Text>
      <Text style={styles.emptyDesc}>
        {searchQuery.trim()
          ? `No notices matched "${searchQuery}". Try a different keyword.`
          : "You're all caught up with official university announcements."}
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
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  skeletonPill: {
    width: 80,
    height: 22,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#e2e8f0",
  },
  skeletonTitle: {
    height: 18,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  skeletonRef: {
    width: "40%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
    marginTop: 4,
    marginBottom: 16,
  },
  skeletonFooter: {
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  errorCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 28,
    marginHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(186, 26, 26, 0.1)",
    ...BENTO_COLORS.shadow,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 8,
  },
  errorDesc: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  retryButtonText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.white,
  },
  emptyCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 32,
    marginHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  emptyActionBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
