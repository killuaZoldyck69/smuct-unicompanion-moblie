/**
 * ============================================================================
 * REDESIGN RATIONALE: EXPLORE FEATURES (SIMPLIFIED SKELETON & DIRECTORY GRID)
 * ============================================================================
 * (a) WHY SEARCH, HERO CARD, AND FILTER TABS WERE REMOVED:
 *     With exactly 13 student features presented in an ergonomic 2-column grid,
 *     users can visually scan the complete directory in a single natural glance.
 *     The search toggle, the large dark hero banner with stat tallies, and the
 *     horizontal category filter pills added redundant visual noise and layout
 *     overhead for a directory size that does not yet warrant multi-layer filtering.
 *     Removing them creates an immediate, friction-free gateway straight into
 *     the services students want to access.
 *
 * (b) WHERE CATEGORY DATA NOW LIVES (ZERO DATA MODEL DEGRADATION):
 *     The underlying category categorization ("ACADEMIC" | "CAMPUS" | "SUPPORT" |
 *     "ADMIN") remains strictly preserved as a first-class metadata property on
 *     every `MenuItemConfig` in `constants.ts`. While the filter tab UI has been
 *     removed from the viewport, this metadata directly drives the semantic
 *     category color logic and badge styling, and can be reintroduced as a visual
 *     filter at any future time with zero schema or architectural changes.
 *
 * (c) COLOR-LOGIC & TYPOGRAPHIC HIERARCHY DECISIONS:
 *     - Deliberate Category-Bound Color Logic: Instead of arbitrary pastel color
 *       cycling per card, each card's badge and accent borders are semantically
 *       bound to its category (Academic = Blue #1d4ed8, Campus Life = Emerald
 *       #047857, Support = Rose #be123c, Admin = Violet #6d28d9).
 *     - 2-Line Wrapped Titles (Truncation Fix): Replaced 1-line truncation with a
 *       fixed-height 2-line title box (minHeight: 40, lineHeight: 20) so all 13
 *       feature titles (notably "Academic Calendar" and "Course Evaluation") wrap
 *       cleanly with zero awkward clipping or ellipsis cutoff.
 *     - Visual Hierarchy: Feature title is heaviest (15px, 800 weight, #131b2e),
 *       subtitle is secondary (11.5px, 500 weight, #64748b), asset illustration
 *       is crisp (28x28 inside 44x44 badge), and the arrow-up-right affordance is
 *       a quiet 24x24 chip that doesn't compete for dominance.
 *     - Deliberate Breathing Room: Dedicated 12px top spacing directly under the
 *       header gives the grid an intentional entry rhythm without the hero card.
 * ============================================================================
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  BENTO_COLORS,
  SPACING,
  fontFamily,
  ALL_MENU_ITEMS,
} from "./constants";
import { MenuItemCard } from "./components/menu-item-card";

export { BENTO_COLORS, ALL_MENU_ITEMS, SPACING, CATEGORY_THEMES } from "./constants";

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
    paddingHorizontal: SPACING.xl, // 20px
    paddingTop: SPACING.md, // 12px
    paddingBottom: SPACING.lg, // 16px
    backgroundColor: BENTO_COLORS.background,
  },
  headerTitle: {
    fontFamily,
    fontSize: 28,
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
    paddingTop: SPACING.md, // 12px deliberate breathing room under the header
  },
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl, // 20px
    rowGap: SPACING.md, // 12px
  },
});
