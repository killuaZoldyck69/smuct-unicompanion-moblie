import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

interface MPDetailHeaderProps {
  isSelling: boolean;
  onBack: () => void;
}

export function MPDetailHeader({ isSelling, onBack }: MPDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconBtn}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back to marketplace"
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
      </TouchableOpacity>

      <Text style={styles.title}>{isSelling ? "For Sale" : "Wanted Item"}</Text>

      {/* Spacer keeps title centred */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.04)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  title: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  spacer: {
    width: 38,
  },
});
