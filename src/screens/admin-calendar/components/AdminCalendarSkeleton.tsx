import React from "react";
import { StyleSheet, View } from "react-native";

const SkeletonBlock = React.memo(function SkeletonBlock({
  style,
}: {
  style: object;
}) {
  return <View style={[styles.block, style]} />;
});

export const AdminCalendarListSkeleton = React.memo(
  function AdminCalendarListSkeleton() {
    return (
      <View accessibilityLabel="Loading academic calendars">
        <View style={styles.tabsRow}>
          {[0, 1, 2, 3].map((tab) => (
            <SkeletonBlock key={tab} style={styles.tab} />
          ))}
        </View>
        {[0, 1, 2].map((calendar) => (
          <View key={calendar} style={styles.calendarCard}>
            <View style={styles.chipsRow}>
              <SkeletonBlock style={styles.semesterChip} />
              <SkeletonBlock style={styles.statusChip} />
              <SkeletonBlock style={styles.menuChip} />
            </View>
            <SkeletonBlock style={styles.calendarTitle} />
            <View style={styles.milestonesBox}>
              <SkeletonBlock style={styles.milestoneHeading} />
              {[0, 1, 2, 3].map((row) => (
                <View key={row} style={styles.milestoneRow}>
                  <SkeletonBlock style={styles.milestoneLabel} />
                  <SkeletonBlock style={styles.milestoneValue} />
                </View>
              ))}
            </View>
            <View style={styles.statsRow}>
              {[0, 1, 2].map((stat) => (
                <View key={stat} style={styles.statBox}>
                  <SkeletonBlock style={styles.statValue} />
                  <SkeletonBlock style={styles.statLabel} />
                </View>
              ))}
            </View>
            <SkeletonBlock style={styles.programsLabel} />
            <View style={styles.programsRow}>
              <SkeletonBlock style={styles.programChip} />
              <SkeletonBlock style={styles.programChipWide} />
              <SkeletonBlock style={styles.programChip} />
            </View>
            <SkeletonBlock style={styles.primaryAction} />
          </View>
        ))}
      </View>
    );
  },
);

export const AdminCalendarDetailSkeleton = React.memo(
  function AdminCalendarDetailSkeleton() {
    return (
      <View accessibilityLabel="Loading calendar management details">
        <View style={styles.detailHero}>
          <View style={styles.chipsRow}>
            <SkeletonBlock style={styles.semesterChip} />
            <SkeletonBlock style={styles.statusChip} />
          </View>
          <SkeletonBlock style={styles.calendarTitle} />
          <SkeletonBlock style={styles.detailLineWide} />
          <SkeletonBlock style={styles.detailLineShort} />
          <View style={styles.programsRow}>
            <SkeletonBlock style={styles.programChip} />
            <SkeletonBlock style={styles.programChipWide} />
            <SkeletonBlock style={styles.programChip} />
          </View>
        </View>
        <View style={styles.actionsRow}>
          {[0, 1, 2, 3].map((action) => (
            <View key={action} style={styles.actionTile}>
              <SkeletonBlock style={styles.actionIcon} />
              <SkeletonBlock style={styles.actionLabel} />
            </View>
          ))}
        </View>
        <View style={styles.timelineHeading}>
          <SkeletonBlock style={styles.timelineTitle} />
          <SkeletonBlock style={styles.timelineCount} />
        </View>
        <View style={styles.detailFilters}>
          <SkeletonBlock style={styles.filterActive} />
          <SkeletonBlock style={styles.filter} />
          <SkeletonBlock style={styles.filter} />
        </View>
        {[0, 1, 2].map((week) => (
          <View key={week} style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <SkeletonBlock style={styles.weekTitle} />
              <SkeletonBlock style={styles.weekBadge} />
            </View>
            {[0, 1].map((event) => (
              <View key={event} style={styles.eventRow}>
                <SkeletonBlock style={styles.eventDate} />
                <View style={styles.eventDetails}>
                  <SkeletonBlock style={styles.eventTitle} />
                  <SkeletonBlock style={styles.eventMeta} />
                </View>
                <SkeletonBlock style={styles.eventMenu} />
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    width: 82,
    height: 32,
    borderRadius: 16,
  },
  calendarCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  semesterChip: {
    width: 118,
    height: 24,
    borderRadius: 12,
  },
  statusChip: {
    width: 64,
    height: 22,
    borderRadius: 11,
  },
  menuChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: "auto",
  },
  calendarTitle: {
    width: "68%",
    height: 20,
    marginTop: 16,
    marginBottom: 14,
  },
  milestonesBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    marginBottom: 12,
  },
  milestoneHeading: {
    width: 110,
    height: 11,
    marginBottom: 10,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  milestoneLabel: {
    width: "42%",
    height: 10,
  },
  milestoneValue: {
    width: "34%",
    height: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    gap: 7,
  },
  statValue: {
    width: 28,
    height: 16,
  },
  statLabel: {
    width: 48,
    height: 9,
  },
  programsLabel: {
    width: 110,
    height: 11,
    marginBottom: 8,
  },
  programsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  programChip: {
    width: 64,
    height: 23,
    borderRadius: 7,
  },
  programChipWide: {
    width: 96,
    height: 23,
    borderRadius: 7,
  },
  primaryAction: {
    height: 42,
    marginTop: 14,
    borderRadius: 12,
  },
  detailHero: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  detailLineWide: {
    width: "88%",
    height: 12,
    marginBottom: 9,
  },
  detailLineShort: {
    width: "62%",
    height: 12,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 20,
  },
  actionTile: {
    flex: 1,
    height: 74,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
  },
  actionLabel: {
    width: 40,
    height: 9,
  },
  timelineHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timelineTitle: {
    width: 132,
    height: 17,
  },
  timelineCount: {
    width: 62,
    height: 20,
    borderRadius: 10,
  },
  detailFilters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterActive: {
    width: 70,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#cbd5e1",
  },
  filter: {
    width: 92,
    height: 30,
    borderRadius: 15,
  },
  weekCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  weekTitle: {
    width: 112,
    height: 16,
  },
  weekBadge: {
    width: 72,
    height: 20,
    borderRadius: 10,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 10,
  },
  eventDate: {
    width: 42,
    height: 38,
    borderRadius: 8,
  },
  eventDetails: {
    flex: 1,
    gap: 7,
  },
  eventTitle: {
    width: "76%",
    height: 12,
  },
  eventMeta: {
    width: "50%",
    height: 9,
  },
  eventMenu: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
});
