import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  titleFontFamily,
} from "@/screens/campus-hub/shared/design-tokens";

interface LFDetailHeaderProps {
  isLost: boolean;
  onBack: () => void;
  onReport?: () => void;
}

export function LFDetailHeader({
  isLost,
  onBack,
  onReport,
}: LFDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.78 }]}
        android_ripple={{
          color: CAMPUS_HUB_COLORS.androidRipple,
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Go back to Lost & Found feed"
      >
        <Feather
          name="arrow-left"
          size={20}
          color={CAMPUS_HUB_COLORS.deepNavy}
        />
      </Pressable>

      <Text
        style={styles.title}
        numberOfLines={1}
        accessibilityRole="header"
        maxFontSizeMultiplier={1.25}
      >
        {isLost ? "Lost Item Listing" : "Found Item Listing"}
      </Text>

      {onReport ? (
        <Pressable
          onPress={onReport}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && { opacity: 0.78 },
          ]}
          android_ripple={{
            color: CAMPUS_HUB_COLORS.androidRipple,
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Report listing"
        >
          <Feather name="flag" size={17} color={CAMPUS_HUB_COLORS.mutedInk} />
        </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: CAMPUS_HUB_COLORS.background,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  title: {
    fontFamily: titleFontFamily,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: CAMPUS_HUB_COLORS.deepNavy,
    flexShrink: 1,
    marginHorizontal: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconBtnPlaceholder: {
    width: 40,
  },
});
