import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { CAMPUS_HUB_COLORS } from "@/screens/campus-hub/shared/design-tokens";

export const ComplaintStatsLoadingSkeleton = React.memo(
  function ComplaintStatsLoadingSkeleton() {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsList}
        accessibilityLabel="Loading complaint status counts"
      >
        {[0, 1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={styles.statIcon} />
              <View style={styles.statCount} />
            </View>
            <View style={styles.statLabel} />
          </View>
        ))}
      </ScrollView>
    );
  },
);

export const ComplaintLoadingSkeleton = React.memo(
  function ComplaintLoadingSkeleton({ isAdmin = false }: { isAdmin?: boolean }) {
    return (
      <View style={styles.list} accessibilityLabel="Loading complaints">
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.categoryBadge} />
              <View style={styles.statusBadge} />
            </View>

            {isAdmin && (
              <View style={styles.identityRow}>
                <View style={styles.avatar} />
                <View style={styles.identityText}>
                  <View style={styles.identityName} />
                  <View style={styles.identityMeta} />
                </View>
              </View>
            )}

            {!isAdmin && <View style={styles.identityMeta} />}
            <View style={styles.title} />
            <View style={styles.description} />
            <View style={styles.descriptionShort} />
            <View style={styles.separator} />
            <View style={styles.footerRow}>
              <View style={styles.ticketId} />
              <View style={styles.date} />
            </View>
            {isAdmin && (
              <View style={styles.actionsRow}>
                <View style={styles.actionButton} />
                <View style={styles.actionButton} />
              </View>
            )}
          </View>
        ))}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  statsList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  statsScroll: {
    height: 94,
    flexGrow: 0,
    flexShrink: 0,
  },
  statCard: {
    width: 84,
    height: 78,
    borderRadius: 16,
    padding: 10,
    justifyContent: "space-between",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e2e8f0",
  },
  statCount: {
    width: 18,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
  },
  statLabel: {
    width: 50,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  categoryBadge: {
    width: 88,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e2e8f0",
  },
  statusBadge: {
    width: 78,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e2e8f0",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e2e8f0",
  },
  identityText: {
    flex: 1,
    gap: 7,
  },
  identityName: {
    width: "52%",
    height: 13,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
  },
  identityMeta: {
    width: "45%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 12,
  },
  title: {
    width: "76%",
    height: 17,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
    marginBottom: 10,
  },
  description: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 7,
  },
  descriptionShort: {
    width: "68%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ticketId: {
    width: 94,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  date: {
    width: 82,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
});
