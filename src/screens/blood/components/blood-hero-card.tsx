import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { BENTO_COLORS, BloodFeedCounts, fontFamily } from "../constants";

export interface BloodHeroCardProps {
  counts: BloodFeedCounts;
  selectedFilter?: string;
  onPressCta?: () => void;
  onPressStat?: (type: "ALL" | "ACTIVE" | "FULFILLED" | "URGENT") => void;
}

export const BloodHeroCard = React.memo(function BloodHeroCard({
  counts,
  selectedFilter = "ACTIVE",
  onPressStat,
}: BloodHeroCardProps) {
  const hasUrgent = counts.urgent > 0;

  return (
    <View
      style={styles.card}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Blood Bank overview: ${counts.total} total requests, ${counts.active} active, ${counts.fulfilled} fulfilled.`}
    >
      {/* Urgent Alert Banner (shown only when urgent requests exist) */}
      {hasUrgent && (
        <View style={styles.urgentBannerRow}>
          <TouchableOpacity
            style={styles.urgentAlertBadge}
            onPress={() => onPressStat?.("URGENT")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${counts.urgent} urgent blood requests`}
          >
            <View style={styles.pulseDot} />
            <Text style={styles.urgentAlertBadgeText}>
              {counts.urgent} URGENT REQUEST{counts.urgent > 1 ? "S" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mini Bento Statistics (3 Modular Filter Cells: All, Active, Fulfilled) */}
      <View style={styles.bentoStatsGrid}>
        {/* All Option */}
        <TouchableOpacity
          style={[
            styles.bentoStatCell,
            selectedFilter === "ALL"
              ? styles.bentoCellActiveSelected
              : styles.bentoCellDefault,
          ]}
          onPress={() => onPressStat?.("ALL")}
          disabled={!onPressStat}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`All requests: ${counts.total}`}
        >
          <Text
            style={[
              styles.statNumber,
              selectedFilter === "ALL" && styles.statNumberSelected,
            ]}
          >
            {counts.total}
          </Text>
          <Text
            style={[
              styles.statLabel,
              selectedFilter === "ALL" && styles.statLabelSelected,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Active Option */}
        <TouchableOpacity
          style={[
            styles.bentoStatCell,
            selectedFilter === "ACTIVE"
              ? styles.bentoCellActiveSelected
              : styles.bentoCellDefault,
          ]}
          onPress={() => onPressStat?.("ACTIVE")}
          disabled={!onPressStat}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Active requests: ${counts.active}`}
        >
          <Text
            style={[
              styles.statNumber,
              selectedFilter === "ACTIVE" && styles.statNumberSelected,
            ]}
          >
            {counts.active}
          </Text>
          <Text
            style={[
              styles.statLabel,
              selectedFilter === "ACTIVE" && styles.statLabelSelected,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>

        {/* Fulfilled Option */}
        <TouchableOpacity
          style={[
            styles.bentoStatCell,
            selectedFilter === "FULFILLED"
              ? styles.bentoCellFulfilledSelected
              : counts.fulfilled > 0
              ? styles.bentoCellFulfilled
              : styles.bentoCellDefault,
          ]}
          onPress={() => onPressStat?.("FULFILLED")}
          disabled={!onPressStat}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Fulfilled requests: ${counts.fulfilled}`}
        >
          <Text
            style={[
              styles.statNumber,
              selectedFilter === "FULFILLED"
                ? styles.statNumberSelected
                : counts.fulfilled > 0
                ? styles.statNumberFulfilled
                : undefined,
            ]}
          >
            {counts.fulfilled}
          </Text>
          <Text
            style={[
              styles.statLabel,
              selectedFilter === "FULFILLED"
                ? styles.statLabelSelected
                : counts.fulfilled > 0
                ? styles.statLabelFulfilled
                : undefined,
            ]}
          >
            Fulfilled
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...BENTO_COLORS.shadow,
  },
  /* Urgent Banner */
  urgentBannerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  urgentAlertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: BENTO_COLORS.crimson,
    marginRight: 4,
  },
  urgentAlertBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
    letterSpacing: 0.5,
  },

  /* Mini Bento Statistics Grid */
  bentoStatsGrid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bentoStatCell: {
    flex: 1,
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  bentoCellDefault: {
    backgroundColor: "#f8fafc",
    borderColor: "#f1f5f9",
  },
  bentoCellActiveSelected: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  bentoCellFulfilled: {
    backgroundColor: "#f0fdf4",
    borderColor: "#dcfce7",
  },
  bentoCellFulfilledSelected: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  statNumber: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  statNumberSelected: {
    color: "#ffffff",
  },
  statNumberFulfilled: {
    color: "#059669",
  },
  statLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  statLabelSelected: {
    color: "#ffffff",
  },
  statLabelFulfilled: {
    color: "#047857",
  },
});
