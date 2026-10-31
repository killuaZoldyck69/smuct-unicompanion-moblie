import React from "react";
import { View, StyleSheet } from "react-native";
import { THEME } from "../constants";

export const UserDirectorySkeleton = React.memo(
  function UserDirectorySkeleton() {
    return (
      <View style={styles.container}>
        {[0, 1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.card}>
            <View style={styles.avatar} />
            <View style={styles.details}>
              <View
                style={[
                  styles.name,
                  item % 2 === 0 && styles.nameShort,
                ]}
              />
              <View style={styles.info} />
            </View>
            <View style={styles.chevron} />
          </View>
        ))}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  card: {
    minHeight: 78,
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    marginRight: 14,
  },
  details: {
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  name: {
    width: "62%",
    height: 14,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  nameShort: {
    width: "48%",
  },
  info: {
    width: "72%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F1F5F9",
  },
  chevron: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#E2E8F0",
    transform: [{ rotate: "45deg" }],
    marginRight: 3,
  },
});
