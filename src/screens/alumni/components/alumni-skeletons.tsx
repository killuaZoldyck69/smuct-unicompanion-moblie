import React from "react";
import { View, StyleSheet } from "react-native";
import { BENTO } from "../constants";

export const AlumniSkeletons: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.avatar} />
          <View style={styles.info}>
            <View style={styles.row}>
              <View style={styles.title} />
              <View style={styles.badge} />
            </View>
            <View style={styles.line} />
            <View style={styles.lineShort} />
            <View style={styles.pillsRow}>
              <View style={styles.pill} />
              <View style={styles.pill} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
    marginRight: 12,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    width: "45%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  badge: {
    width: 40,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  line: {
    width: "70%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  lineShort: {
    width: "40%",
    height: 10,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  pill: {
    width: 50,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
});
