import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME, fontFamily } from "../constants";

interface TeacherDirectoryEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
  isError?: boolean;
  onRetry?: () => void;
}

export const TeacherDirectoryEmptyState = React.memo(
  function TeacherDirectoryEmptyState({
    hasFilters,
    onResetFilters,
    isError = false,
    onRetry,
  }: TeacherDirectoryEmptyStateProps) {
    if (isError) {
      return (
        <View style={styles.centerBox}>
          <View style={[styles.emptyIconCircle, { backgroundColor: "#FEE2E2" }]}>
            <Feather name="alert-triangle" size={32} color="#DC2626" />
          </View>
          <Text style={styles.emptyTitle}>Unable to Load Directory</Text>
          <Text style={styles.emptySubtitle}>
            An unexpected error occurred while connecting to the server. Please check your network and try again.
          </Text>
          {onRetry ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: THEME.primary }]}
              onPress={onRetry}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry loading directory"
            >
              <Feather
                name="refresh-cw"
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnText}>Try Again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.centerBox}>
        <View style={styles.emptyIconCircle}>
          <Feather
            name={hasFilters ? "search" : "users"}
            size={36}
            color={THEME.textMuted}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {hasFilters ? "No Faculty Members Found" : "Directory is Empty"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasFilters
            ? "Try adjusting your search query or department filter."
            : "No faculty members have been registered in the system yet."}
        </Text>

        {hasFilters ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: THEME.primary }]}
            onPress={onResetFilters}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search and filters"
          >
            <Feather
              name="rotate-ccw"
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 40,
    paddingVertical: 30,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
