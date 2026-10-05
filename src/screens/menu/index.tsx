import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  BENTO_COLORS,
  SPACING,
  ALL_MENU_ITEMS,
  MenuItemConfig,
} from "./constants";
import { ExploreHeader } from "./components/explore-header";
import { FeatureSectionHeader } from "./components/feature-section-header";
import { FeatureCard } from "./components/feature-card";

// Re-export constants for backwards compatibility
export {
  BENTO_COLORS,
  ALL_MENU_ITEMS,
  SPACING,
  CATEGORY_THEMES,
} from "./constants";

// ─────────────────────────────────────────────────────────────
// Category ordering — academic first, admin last
// ─────────────────────────────────────────────────────────────
const CATEGORY_ORDER = ["ACADEMIC", "CAMPUS", "SUPPORT", "ADMIN"] as const;

type CategoryKey = typeof CATEGORY_ORDER[number];

function groupByCategory(
  items: MenuItemConfig[],
): Array<{ category: CategoryKey; items: MenuItemConfig[] }> {
  const map = new Map<CategoryKey, MenuItemConfig[]>();
  for (const item of items) {
    const key = item.category as CategoryKey;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  return CATEGORY_ORDER.filter((k) => map.has(k)).map((k) => ({
    category: k,
    items: map.get(k)!,
  }));
}

/**
 * Renders items in a 2-column grid. If there's an odd number of items,
 * the last item spans the full width (matching the screenshot).
 */
function GridSection({ items }: { items: MenuItemConfig[] }) {
  const rows: Array<{ left: MenuItemConfig; right?: MenuItemConfig }> = [];

  for (let i = 0; i < items.length; i += 2) {
    rows.push({ left: items[i], right: items[i + 1] });
  }

  return (
    <View style={grid.container}>
      {rows.map((row, idx) => {
        const isLastOdd = !row.right;
        return (
          <View
            key={row.left.id}
            style={[grid.row, idx > 0 && grid.rowGap]}
          >
            {isLastOdd ? (
              <FeatureCard item={row.left} fullWidth />
            ) : (
              <>
                <FeatureCard item={row.left} />
                <FeatureCard item={row.right!} />
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

const grid = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowGap: {
    marginTop: 12,
  },
});

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
export function Menu() {
  const insets = useSafeAreaInsets();
  const { role: userRole } = useCurrentUser();

  // Role badge
  const roleBadgeText =
    userRole === "ADMIN"
      ? "Admin Controls"
      : userRole === "TEACHER"
        ? "Faculty Tools"
        : "Student Services";

  // Filter by role then group by category
  const sections = useMemo(() => {
    const role = userRole || "STUDENT";
    const filtered = ALL_MENU_ITEMS.filter((item) =>
      item.roles.includes(role),
    );
    return groupByCategory(filtered);
  }, [userRole]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <ExploreHeader
        roleBadgeText={roleBadgeText}
      />

      {/* ── Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom > 0 ? insets.bottom + 120 : 132,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sectionIndex) => (
          <View key={section.category}>
            {/* Category Section Header */}
            <FeatureSectionHeader
              category={section.category}
              isFirst={sectionIndex === 0}
            />

            {/* Feature Cards — 2-column grid */}
            <GridSection items={section.items} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  scrollContent: {
    paddingTop: 0,
  },
});
