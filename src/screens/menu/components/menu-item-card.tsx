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
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${theme.label}: ${item.desc}. Double tap to open.`}
    >
      <View style={styles.iconContainer}>
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
            <Feather
              name={item.fallbackIcon}
              size={22}
              color={theme.accentText}
            />
          )}
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </View>

      <Text style={styles.desc} numberOfLines={2}>
        {item.desc}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    paddingVertical: SPACING.lg, // 16px
    paddingHorizontal: SPACING.md, // 12px
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md, // 12px
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  titleContainer: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs, // 4px
  },
  title: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
    lineHeight: 20,
    textAlign: "center",
  },
  desc: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 16,
    minHeight: 32,
    textAlign: "center",
  },
});
