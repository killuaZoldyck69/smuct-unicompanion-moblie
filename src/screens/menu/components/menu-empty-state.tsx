import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface MenuEmptyStateProps {
  searchQuery: string;
  onReset: () => void;
}

export const MenuEmptyState = React.memo(function MenuEmptyState({
  searchQuery,
  onReset,
}: MenuEmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Feather name="search" size={32} color={BENTO_COLORS.subtleText} />
      </View>
      <Text style={styles.title}>No matching services</Text>
      <Text style={styles.desc}>
        {searchQuery.trim()
          ? `No services matched "${searchQuery}". Try a different keyword or filter.`
          : "No services available in this category."}
      </Text>
      <TouchableOpacity
        style={styles.resetBtn}
        onPress={onReset}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Reset filters and show all services"
      >
        <Text style={styles.resetBtnText}>View All Services</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 32,
    marginHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...BENTO_COLORS.shadow,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 8,
  },
  desc: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  resetBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  resetBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.white,
  },
});
