import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
} from "@/screens/campus-hub/shared/design-tokens";

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
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.78 }]}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        android_ripple={{
          color: CAMPUS_HUB_COLORS.androidRipple,
          borderless: true,
        }}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back to marketplace"
      >
        <Feather
          name="arrow-left"
          size={20}
          color={CAMPUS_HUB_COLORS.deepNavy}
        />
      </Pressable>

      <Text style={styles.title} maxFontSizeMultiplier={1.2}>
        {isSelling ? "For Sale" : "Wanted Item"}
      </Text>

      {onReportPost ? (
        <Pressable
          onPress={onReportPost}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && { opacity: 0.78 },
          ]}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          android_ripple={{
            color: CAMPUS_HUB_COLORS.androidRipple,
            borderless: true,
          }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Report listing"
        >
          <Feather name="flag" size={17} color={CAMPUS_HUB_COLORS.subtleText} />
        </Pressable>
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
    lineHeight: 22,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    includeFontPadding: false,
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
