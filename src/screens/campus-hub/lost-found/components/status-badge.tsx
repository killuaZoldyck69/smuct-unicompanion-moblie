import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CATEGORY_LABELS,
} from "@/features/campus-hub/lost-found-logic";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import { colors } from "@/theme/colors";
import type {
  LostFoundType,
  LostFoundStatus,
  LostFoundCategory,
} from "@/services/lost-found-service";

export { CATEGORY_LABELS };

export const CATEGORY_ICONS: Record<LostFoundCategory, keyof typeof Feather.glyphMap> = {
  ID_CARD: "credit-card",
  ELECTRONICS: "smartphone",
  KEYS: "key",
  WALLET: "pocket",
  BAGS: "briefcase",
  BOOKS: "book-open",
  DOCUMENTS: "file-text",
  ACCESSORIES: "watch",
  CLOTHING: "tag",
  STATIONERY: "edit-3",
  UMBRELLA: "umbrella",
  BOTTLE: "coffee",
  OTHER: "box",
};

interface TypeBadgeProps {
  type: LostFoundType;
  size?: "small" | "medium";
}

export const TypeBadge = React.memo(function TypeBadge({
  type,
  size = "small",
}: TypeBadgeProps) {
  const isLost = type === "LOST";
  const bg = isLost ? CAMPUS_HUB_COLORS.lostRoseBg : CAMPUS_HUB_COLORS.foundTealBg;
  const color = isLost ? CAMPUS_HUB_COLORS.lostRoseText : CAMPUS_HUB_COLORS.foundTealText;
  const border = isLost ? CAMPUS_HUB_COLORS.lostRoseBorder : CAMPUS_HUB_COLORS.foundTealBorder;
  const icon = isLost ? "search" : "check-circle";

  return (
    <View
      style={[
        styles.badge,
        size === "medium" && styles.badgeMedium,
        { backgroundColor: bg, borderColor: border },
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Item type: ${isLost ? "Lost" : "Found"}`}
    >
      <Feather
        name={icon}
        size={size === "medium" ? 12 : 10}
        color={color}
        style={{ marginRight: 4 }}
      />
      <Text
        style={[
          styles.badgeText,
          size === "medium" && styles.badgeTextMedium,
          { color },
        ]}
        maxFontSizeMultiplier={1.25}
      >
        {isLost ? "LOST" : "FOUND"}
      </Text>
    </View>
  );
});

interface StatusBadgeProps {
  status: LostFoundStatus;
  size?: "small" | "medium";
}

export const StatusBadge = React.memo(function StatusBadge({
  status,
  size = "small",
}: StatusBadgeProps) {
  if (status === "ACTIVE") return null;

  const isResolved = status === "RESOLVED" || status === "CLAIMED";
  const bg = isResolved ? CAMPUS_HUB_COLORS.resolvedGreenBg : colors.slate100;
  const color = isResolved
    ? CAMPUS_HUB_COLORS.resolvedGreenText
    : CAMPUS_HUB_COLORS.mutedInk;
  const border = isResolved
    ? CAMPUS_HUB_COLORS.resolvedGreenBorder
    : colors.slate200;
  const label = isResolved ? "RESOLVED" : status;
  const icon = isResolved ? "check" : "info";

  return (
    <View
      style={[
        styles.badge,
        size === "medium" && styles.badgeMedium,
        { backgroundColor: bg, borderColor: border },
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      <Feather
        name={icon}
        size={size === "medium" ? 12 : 10}
        color={color}
        style={{ marginRight: 4 }}
      />
      <Text
        style={[
          styles.badgeText,
          size === "medium" && styles.badgeTextMedium,
          { color },
        ]}
        maxFontSizeMultiplier={1.25}
      >
        {label}
      </Text>
    </View>
  );
});

interface CategoryBadgeProps {
  category: LostFoundCategory;
  size?: "small" | "medium";
}

export const CategoryBadge = React.memo(function CategoryBadge({
  category,
  size = "small",
}: CategoryBadgeProps) {
  const label = CATEGORY_LABELS[category] ?? category;
  const icon = CATEGORY_ICONS[category] ?? "tag";

  return (
    <View
      style={[
        styles.categoryBadge,
        size === "medium" && styles.categoryBadgeMedium,
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Category: ${label}`}
    >
      <Feather
        name={icon}
        size={size === "medium" ? 12 : 10}
        color={CAMPUS_HUB_COLORS.mutedInk}
        style={{ marginRight: 4 }}
      />
      <Text
        style={[
          styles.categoryBadgeText,
          size === "medium" && styles.categoryBadgeTextMedium,
        ]}
        maxFontSizeMultiplier={1.25}
      >
        {label}
      </Text>
    </View>
  );
});

interface LocationBadgeProps {
  location: string;
  size?: "small" | "medium";
}

export const LocationBadge = React.memo(function LocationBadge({
  location,
  size = "small",
}: LocationBadgeProps) {
  if (!location) return null;

  return (
    <View
      style={[
        styles.locationBadge,
        size === "medium" && styles.locationBadgeMedium,
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Location: ${location}`}
    >
      <Feather
        name="map-pin"
        size={size === "medium" ? 11 : 10}
        color={colors.semantic.red.accent}
        style={{ marginRight: 4 }}
      />
      <Text
        style={[
          styles.locationBadgeText,
          size === "medium" && styles.locationBadgeTextMedium,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
        maxFontSizeMultiplier={1.25}
      >
        {location}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  badgeText: {
    fontFamily,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  badgeTextMedium: {
    fontSize: 10.5,
    lineHeight: 13,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate100,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  categoryBadgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.mutedInk,
    includeFontPadding: false,
  },
  categoryBadgeTextMedium: {
    fontSize: 10.5,
    lineHeight: 13,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  locationBadgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  locationBadgeText: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    color: colors.slate800,
    letterSpacing: -0.1,
    flexShrink: 1,
    includeFontPadding: false,
  },
  locationBadgeTextMedium: {
    fontSize: 11.5,
    lineHeight: 15,
  },
});
