import React from "react";
import { View, StyleSheet } from "react-native";
import { BENTO } from "../constants";

export const AlumniSkeletons: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <View key={idx} style={styles.card}>
          {/* Avatar Skeleton */}
          <View style={styles.avatar} />

          {/* Text Content Skeleton */}
          <View style={styles.info}>
            <View style={styles.nameLine} />
            <View style={styles.roleLine} />
            <View style={styles.academicLine} />
          </View>

          {/* Chevron Placeholder */}
          <View style={styles.chevron} />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BENTO.surfaceSecondary,
    marginRight: 14,
  },
  info: {
    flex: 1,
    gap: 7,
    justifyContent: "center",
  },
  nameLine: {
    width: "48%",
    height: 14,
    borderRadius: 6,
    backgroundColor: BENTO.surfaceSecondary,
  },
  roleLine: {
    width: "72%",
    height: 12,
    borderRadius: 5,
    backgroundColor: BENTO.slateSubtle,
  },
  academicLine: {
    width: "55%",
    height: 11,
    borderRadius: 5,
    backgroundColor: BENTO.slateSubtle,
  },
  chevron: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: BENTO.surfaceSecondary,
    marginLeft: 8,
  },
});

