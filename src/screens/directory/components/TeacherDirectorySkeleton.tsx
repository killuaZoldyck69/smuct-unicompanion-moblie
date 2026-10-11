import React from "react";
import { View, StyleSheet } from "react-native";
import { DIRECTORY_COLORS } from "../constants";

export const TeacherDirectorySkeleton = React.memo(function TeacherDirectorySkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.avatarSkeleton} />
            <View style={styles.infoCol}>
              <View style={styles.nameSkeleton} />
              <View style={styles.designationSkeleton} />
              <View style={styles.deptSkeleton} />
            </View>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.pillSkeleton} />
            <View style={styles.pillSkeletonSmall} />
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: DIRECTORY_COLORS.surface,
    borderRadius: DIRECTORY_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.cardBorder,
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#e2e8f0",
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    gap: 6,
  },
  nameSkeleton: {
    width: "60%",
    height: 16,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
  },
  designationSkeleton: {
    width: "45%",
    height: 12,
    borderRadius: 5,
    backgroundColor: "#f1f5f9",
  },
  deptSkeleton: {
    width: "70%",
    height: 11,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  bottomRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: DIRECTORY_COLORS.divider,
  },
  pillSkeleton: {
    width: 80,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  pillSkeletonSmall: {
    width: 90,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
});
