import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useCurrentUser } from "@/hooks/use-current-user";
import { BENTO_COLORS, SPACING, fontFamily, ALL_MENU_ITEMS } from "./constants";
import { MenuItemCard } from "./components/menu-item-card";

export {
  BENTO_COLORS,
  ALL_MENU_ITEMS,
  SPACING,
  CATEGORY_THEMES,
} from "./constants";

export function Menu() {
  const insets = useSafeAreaInsets();
  const { role: userRole } = useCurrentUser();

  // Filter items strictly by user role while preserving category metadata
  const accessibleItems = useMemo(() => {
    const role = userRole || "STUDENT";
    return ALL_MENU_ITEMS.filter((item) => item.roles.includes(role));
  }, [userRole]);

  const roleBadgeText =
    userRole === "ADMIN"
      ? "Admin Controls"
      : userRole === "TEACHER"
        ? "Faculty Tools"
        : "Student Services";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Streamlined Header: Title + Subtitle Only (Search icon removed) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Features</Text>
        <View style={styles.roleBadgeRow}>
          <View style={styles.roleBadgeDot} />
          <Text style={styles.roleBadgeText}>{roleBadgeText}</Text>
        </View>
      </View>

      {/* Feature Grid: Hero banner and category filter tabs removed */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 132 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bentoGrid}>
          {accessibleItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    backgroundColor: BENTO_COLORS.background,
  },
  headerTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.5,
  },
  roleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs, // 4px
    gap: 6,
  },
  roleBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  scrollContent: {
    paddingTop: SPACING.md,
  },
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    rowGap: SPACING.md,
  },
});
