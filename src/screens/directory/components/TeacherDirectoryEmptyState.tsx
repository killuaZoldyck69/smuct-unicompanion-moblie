import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DIRECTORY_COLORS, fontFamily } from "../constants";

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
        <View style={styles.container}>
          <View style={[styles.iconCircle, { backgroundColor: "#fee2e2" }]}>
            <Feather name="alert-triangle" size={28} color="#dc2626" />
          </View>
          <Text style={styles.title}>Unable to Load Directory</Text>
          <Text style={styles.desc}>
            An unexpected error occurred while fetching faculty members. Please check your connection and try again.
          </Text>
          {onRetry ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Feather
                name="refresh-cw"
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnText}>Try Again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Feather
            name={hasFilters ? "search" : "users"}
            size={28}
            color={DIRECTORY_COLORS.blueBadge}
          />
        </View>
        <Text style={styles.title}>
          {hasFilters ? "No Teachers Found" : "Directory is Empty"}
        </Text>
        <Text style={styles.desc}>
          {hasFilters
            ? "We couldn't find any faculty members matching your search term or department filter."
            : "No faculty members have been registered in the system yet."}
        </Text>

        {hasFilters ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onResetFilters}
            activeOpacity={0.8}
          >
            <Feather
              name="rotate-ccw"
              size={14}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnText}>Clear Search & Filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DIRECTORY_COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  desc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: DIRECTORY_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIRECTORY_COLORS.deepNavy,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: DIRECTORY_COLORS.pillRadius,
    ...DIRECTORY_COLORS.shadow,
  },
  actionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
