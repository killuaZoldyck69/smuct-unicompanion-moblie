import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BENTO_COLORS, MenuItemConfig, fontFamily } from "../constants";

interface MenuItemCardProps {
  item: MenuItemConfig;
}

export const MenuItemCard = React.memo(function MenuItemCard({
  item,
}: MenuItemCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(item.route)}
      activeOpacity={0.85}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}: ${item.desc}. Tap to open.`}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: item.theme.bg }]}>
          <Feather name={item.icon} size={20} color={item.theme.iconColor} />
        </View>
        <View style={styles.arrowCircle}>
          <Feather
            name="arrow-up-right"
            size={13}
            color={BENTO_COLORS.subtleText}
          />
        </View>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
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
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...BENTO_COLORS.shadow,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 4,
  },
  desc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 16,
  },
});
