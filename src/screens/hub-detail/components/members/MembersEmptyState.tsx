import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./constants";

export const MembersEmptyState = React.memo(function MembersEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name="users" size={22} color={BENTO.slateLight} />
      </View>
      <Text style={styles.title}>No members enrolled</Text>
      <Text style={styles.subtitle}>
        Share the course join code with your classmates to get them enrolled.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 17,
  },
});
