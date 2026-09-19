import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import type {
  LostFoundType,
  LostFoundStatus,
  LostFoundCategory,
} from "@/services/lost-found-service";

export const CATEGORY_LABELS: Record<LostFoundCategory, string> = {
  BOOKS: "Books & Notes",
  ELECTRONICS: "Electronics",
  ID_CARD: "ID Card",
  KEYS: "Keys",
  CLOTHING: "Clothing",
  OTHER: "Other Item",
};

export const CATEGORY_ICONS: Record<LostFoundCategory, keyof typeof Feather.glyphMap> = {
  BOOKS: "book",
  ELECTRONICS: "smartphone",
  ID_CARD: "credit-card",
  KEYS: "key",
  CLOTHING: "tag",
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
  const bg = isResolved ? CAMPUS_HUB_COLORS.resolvedGreenBg : "#f1f5f9";
  const color = isResolved ? CAMPUS_HUB_COLORS.resolvedGreenText : "#64748b";
  const border = isResolved ? CAMPUS_HUB_COLORS.resolvedGreenBorder : "#e2e8f0";
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
        color={CAMPUS_HUB_COLORS.subtleText}
        style={{ marginRight: 4 }}
      />
      <Text
        style={[
          styles.categoryBadgeText,
          size === "medium" && styles.categoryBadgeTextMedium,
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  badgeTextMedium: {
    fontSize: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryBadgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  categoryBadgeTextMedium: {
    fontSize: 10,
  },
});
