import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface ClassworkEmptyStateProps {
  canManage: boolean;
  onCreatePress: () => void;
}

export const ClassworkEmptyState: React.FC<ClassworkEmptyStateProps> = React.memo(
  ({ canManage, onCreatePress }) => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Feather name="book-open" size={32} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>No Classwork Assigned</Text>
        <Text style={styles.emptySubtitle}>
          {canManage
            ? "Publish assignments, schedule CT quizzes, or setup presentation milestones for students."
            : "Assignments, CT quizzes, and presentations will appear here once assigned by faculty."}
        </Text>
        {canManage && (
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={onCreatePress}
            activeOpacity={0.85}
          >
            <Feather
              name="plus"
              size={16}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.emptyActionText}>Create Classwork</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

ClassworkEmptyState.displayName = "ClassworkEmptyState";

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  emptyActionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
