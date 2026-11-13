import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
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
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        android_ripple={{
          color: CAMPUS_HUB_COLORS.androidRipple,
          borderless: true,
        }}
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

      <Text style={styles.title} numberOfLines={1}>
        {isLost ? "Lost Item Listing" : "Found Item Listing"}
      </Text>

      {onReport ? (
        <Pressable
          onPress={onReport}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.78 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          android_ripple={{
            color: CAMPUS_HUB_COLORS.androidRipple,
            borderless: true,
          }}
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
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    flexShrink: 1,
    marginHorizontal: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  iconBtnPlaceholder: {
    width: 38,
  },
});
