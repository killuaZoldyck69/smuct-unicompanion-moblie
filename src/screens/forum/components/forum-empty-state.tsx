import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import type { FilterType } from "../types";

interface ForumEmptyStateProps {
  searchQuery: string;
  activeFilter: FilterType;
  onResetFilter: () => void;
}

export const ForumEmptyState = memo(function ForumEmptyState({
  searchQuery,
  activeFilter,
  onResetFilter,
}: ForumEmptyStateProps) {
  const hasQuery = searchQuery.trim().length > 0;

  const title = hasQuery
    ? "No matching discussions"
    : activeFilter === "UNRESOLVED"
      ? "No Unresolved Questions"
      : activeFilter === "RESOLVED"
        ? "No Resolved Discussions Yet"
        : activeFilter === "MY_POSTS"
          ? "You haven't posted yet"
          : "No Discussions Found";

  const description = hasQuery
    ? `No discussions matched "${searchQuery.trim()}". Try searching with a different keyword.`
    : activeFilter === "MY_POSTS"
      ? "Have a question or course insight? Tap the + button to ask the campus community!"
      : "Be the first student or faculty member to start a discussion!";

  return (
    <View style={styles.emptyBentoCard}>
      <View style={styles.emptyIconCircle}>
        <Feather
          name="message-square"
          size={36}
          color={BENTO_COLORS.subtleText}
        />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{description}</Text>

      {activeFilter !== "ALL" && (
        <TouchableOpacity
          style={styles.emptyResetBtn}
          onPress={onResetFilter}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View all forum discussions"
        >
          <Text style={styles.emptyResetBtnText}>View All Posts</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  emptyBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 34,
    alignItems: "center",
    marginTop: 10,
    ...BENTO_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyDesc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  emptyResetBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  emptyResetBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
