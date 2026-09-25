import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

interface LFDetailHeaderProps {
  isLost: boolean;
  canDelete: boolean;
  onBack: () => void;
  onOpenOverflow: () => void;
}

export function LFDetailHeader({
  isLost,
  canDelete,
  onBack,
  onOpenOverflow,
}: LFDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconBtn}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back to Lost & Found feed"
      >
        <Feather name="arrow-left" size={22} color={CAMPUS_HUB_COLORS.deepNavy} />
      </TouchableOpacity>

      <Text style={styles.title}>
        {isLost ? "Lost Item Listing" : "Found Item Listing"}
      </Text>

      {canDelete ? (
        <TouchableOpacity
          onPress={onOpenOverflow}
          style={styles.iconBtn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open listing options"
        >
          <Feather name="trash-2" size={20} color={CAMPUS_HUB_COLORS.dangerText} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtnPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  title: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnPlaceholder: {
    width: 44,
  },
});
