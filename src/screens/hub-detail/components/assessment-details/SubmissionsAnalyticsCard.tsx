import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface SubmissionsAnalyticsCardProps {
  total: number;
  submitted: number;
  pending: number;
  graded: number;
  onViewAll: () => void;
}

export const SubmissionsAnalyticsCard: React.FC<SubmissionsAnalyticsCardProps> = React.memo(
  ({ total, submitted, pending, graded, onViewAll }) => {
    return (
      <View style={styles.container}>
        {/* Header Row */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Submissions</Text>
          <TouchableOpacity
            onPress={onViewAll}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View all submissions"
          >
            <Text style={styles.sectionActionText}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* 4 Stats Cards in a Row: Total | Submitted | Pending | Graded */}
        <View style={styles.statsRow}>
          {/* 1. Total */}
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          {/* 2. Submitted */}
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{submitted}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>

          {/* 3. Pending (Pink/Red tint) */}
          <View style={[styles.statBox, styles.statBoxPending]}>
            <Text style={[styles.statNum, { color: "#ef4444" }]}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          {/* 4. Graded (Green tint) */}
          <View style={[styles.statBox, styles.statBoxGraded]}>
            <Text style={[styles.statNum, { color: "#16a34a" }]}>{graded}</Text>
            <Text style={styles.statLabel}>Graded</Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionActionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
  },
  statBoxPending: {
    backgroundColor: "#fff1f2",
    borderColor: "#ffe4e6",
  },
  statBoxGraded: {
    backgroundColor: "#f0fdf4",
    borderColor: "#dcfce7",
  },
  statNum: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
});
