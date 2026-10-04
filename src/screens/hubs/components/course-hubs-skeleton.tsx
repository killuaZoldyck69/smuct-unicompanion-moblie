import React from "react";
import { View, StyleSheet } from "react-native";
import { BENTO_COLORS } from "../constants";

export const CourseHubsSkeleton = React.memo(function CourseHubsSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.skeletonCard}>
          {/* Top Row: Icon + Chevron */}
          <View style={styles.topRow}>
            <View style={styles.iconCircle} />
            <View style={styles.chevronPlaceholder} />
          </View>

          {/* Title Lines */}
          <View style={styles.titleLine1} />
          <View style={styles.titleLine2} />

          {/* Meta Badges */}
          <View style={styles.metaRow}>
            <View style={styles.metaPill1} />
            <View style={styles.metaPill2} />
            <View style={styles.metaPill3} />
          </View>

          {/* Instructor Block */}
          <View style={styles.instructorBox}>
            <View style={styles.instructorAvatar} />
            <View style={styles.instructorTextLines}>
              <View style={styles.instructorLabel} />
              <View style={styles.instructorName} />
            </View>
          </View>

          {/* Footer Pill */}
          <View style={styles.footerPill} />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.05)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  chevronPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
  },
  titleLine1: {
    width: "75%",
    height: 20,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
    marginBottom: 6,
  },
  titleLine2: {
    width: "45%",
    height: 20,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  metaPill1: {
    width: 64,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  metaPill2: {
    width: 58,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  metaPill3: {
    width: 48,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  instructorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 14,
    marginBottom: 12,
  },
  instructorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
  },
  instructorTextLines: {
    marginLeft: 10,
    flex: 1,
  },
  instructorLabel: {
    width: 50,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 5,
  },
  instructorName: {
    width: 110,
    height: 13,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
  },
  footerPill: {
    width: 120,
    height: 28,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
});
