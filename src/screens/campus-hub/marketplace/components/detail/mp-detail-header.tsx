import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

interface MPDetailHeaderProps {
  isSelling: boolean;
  onBack: () => void;
  onReportPost?: () => void;
}

export function MPDetailHeader({
  isSelling,
  onBack,
  onReportPost,
}: MPDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconBtn}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back to marketplace"
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
      </TouchableOpacity>

      <Text style={styles.title}>{isSelling ? "For Sale" : "Wanted Item"}</Text>

      {onReportPost ? (
        <TouchableOpacity
          onPress={onReportPost}
          style={styles.iconBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Report listing"
          activeOpacity={0.7}
        >
          <Feather name="flag" size={17} color={CAMPUS_HUB_COLORS.subtleText} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  spacer: {
    width: 38,
  },
});
