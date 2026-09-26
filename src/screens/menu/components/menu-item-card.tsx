import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  BENTO_COLORS,
  MenuItemConfig,
  CATEGORY_THEMES,
  SPACING,
  fontFamily,
} from "../constants";



interface MenuItemCardProps {
  item: MenuItemConfig;
}

export const MenuItemCard = React.memo(function MenuItemCard({
  item,
}: MenuItemCardProps) {
  const router = useRouter();
  const theme = CATEGORY_THEMES[item.category];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(item.route)}
      activeOpacity={0.75}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${theme.label}: ${item.desc}. Double tap to open.`}
    >
      {/* Icon Badge */}
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: theme.badgeBg,
            borderColor: theme.badgeBorder,
          },
        ]}
      >
        {item.assetIcon ? (
          <Image
            source={item.assetIcon}
            style={styles.iconImage}
            resizeMode="contain"
            accessible={false}
          />
        ) : (
          <Feather name={item.fallbackIcon} size={20} color={theme.accentText} />
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Description */}
      <Text style={[styles.desc, { color: theme.accentText }]} numberOfLines={2}>
        {item.desc}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: BENTO_COLORS.white,
    borderColor: BENTO_COLORS.subtleBorder,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm + 2,
    borderWidth: 1,
    ...BENTO_COLORS.shadow,
    alignItems: "center",
    gap: 2,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 0,
  },
  iconImage: {
    width: 26,
    height: 26,
  },
  title: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.2,
    lineHeight: 17,                   // was 18
    textAlign: "center",
    minHeight: 34,                    // was 36 — 2 lines × 17px
  },
  desc: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    textAlign: "center",
    marginTop: -3,
  },
});
