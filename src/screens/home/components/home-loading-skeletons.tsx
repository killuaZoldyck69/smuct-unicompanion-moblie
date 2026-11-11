import React from "react";
import { StyleSheet, View } from "react-native";

export const WeatherWidgetSkeleton = React.memo(
  function WeatherWidgetSkeleton() {
    return (
      <View
        style={styles.weatherCard}
        accessible={true}
        accessibilityLabel="Loading weather forecast"
      >
        <View style={styles.weatherTopRow}>
          <View style={styles.temperaturePlaceholder} />
          <View style={styles.weatherDetails}>
            <View style={styles.conditionPlaceholder} />
            <View style={styles.weatherLineShort} />
            <View style={styles.weatherLine} />
          </View>
        </View>
        <View style={styles.weatherDivider} />
        <View style={styles.hourlyRow}>
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={styles.hourlyItem}>
              <View style={styles.hourPlaceholder} />
              <View style={styles.hourIconPlaceholder} />
              <View style={styles.hourTempPlaceholder} />
            </View>
          ))}
        </View>
      </View>
    );
  },
);

export const NoticeListSkeleton = React.memo(function NoticeListSkeleton() {
  return (
    <View
      style={styles.noticeCard}
      accessible={true}
      accessibilityLabel="Loading recent notices"
    >
      {[0, 1, 2].map((item) => (
        <View
          key={item}
          style={[
            styles.noticeRow,
            item < 2 && styles.noticeDivider,
          ]}
        >
          <View style={styles.noticeIconPlaceholder} />
          <View style={styles.noticeText}>
            <View style={styles.noticeTitlePlaceholder} />
            <View style={styles.noticeDatePlaceholder} />
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  weatherCard: {
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "#131b2e",
  },
  weatherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  temperaturePlaceholder: {
    width: 115,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  weatherDetails: {
    alignItems: "flex-end",
    gap: 7,
  },
  conditionPlaceholder: {
    width: 104,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 2,
  },
  weatherLine: {
    width: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  weatherLineShort: {
    width: 62,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  weatherDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 14,
  },
  hourlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hourlyItem: {
    alignItems: "center",
    gap: 7,
  },
  hourPlaceholder: {
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  hourIconPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  hourTempPlaceholder: {
    width: 22,
    height: 9,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  noticeCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  noticeRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 14,
  },
  noticeDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f2f4f6",
  },
  noticeIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
  },
  noticeText: {
    flex: 1,
    gap: 8,
  },
  noticeTitlePlaceholder: {
    width: "76%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
  },
  noticeDatePlaceholder: {
    width: "48%",
    height: 9,
    borderRadius: 5,
    backgroundColor: "#f1f5f9",
  },
});
