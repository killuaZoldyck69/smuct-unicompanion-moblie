import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

interface LFDetailHeaderProps {
  isLost: boolean;
  onBack: () => void;
}

export function LFDetailHeader({ isLost, onBack }: LFDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconBtn}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back to Lost & Found feed"
      >
        <Feather name="arrow-left" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
      </TouchableOpacity>

      <Text style={styles.title}>
        {isLost ? "Lost Item Listing" : "Found Item Listing"}
      </Text>

      <View style={styles.iconBtnPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  title: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  iconBtnPlaceholder: {
    width: 38,
  },
});
