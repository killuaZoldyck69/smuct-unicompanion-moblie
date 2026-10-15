import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

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
// Category ordering — academic first for student/faculty, admin first for admin
// ─────────────────────────────────────────────────────────────
const DEFAULT_CATEGORY_ORDER = ["ACADEMIC", "CAMPUS", "SUPPORT", "ADMIN"] as const;

type CategoryKey = (typeof DEFAULT_CATEGORY_ORDER)[number];

function groupByCategory(
  items: MenuItemConfig[],
  categoryOrder: readonly CategoryKey[] = DEFAULT_CATEGORY_ORDER,
): Array<{ category: CategoryKey; items: MenuItemConfig[] }> {
  const map = new Map<CategoryKey, MenuItemConfig[]>();
  for (const item of items) {
    const key = item.category as CategoryKey;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  return categoryOrder.filter((k) => map.has(k)).map((k) => ({
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
          <View key={row.left.id} style={[grid.row, idx > 0 && grid.rowGap]}>
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

/**
 * Renders the Academic section with the requested alternating layout:
 * 1. Academic Calendar (Top, single row, full width)
 * 2. Class Routine & Exam Routine (Single row, 2 columns)
 * 3. CGPA Calculator (Single row in single column, full width)
 * 4. Course Hub & Faculty Directory (Single row, 2 columns)
 */
function AcademicGridSection({ items }: { items: MenuItemConfig[] }) {
  const itemMap = new Map<string, MenuItemConfig>();
  items.forEach((item) => itemMap.set(item.id, item));

  // 1. Academic Calendar (Top, single row, full width)
  const academicCal = itemMap.get("academic_calendar");

  // 2. Class Routine & Exam Routine (Single row, 2 columns)
  const classRoutine = itemMap.get("class_routines");
  const examRoutine = itemMap.get("exam_routines");
  const row2Items = [classRoutine, examRoutine].filter(
    (x): x is MenuItemConfig => !!x,
  );

  // 3. CGPA Calculator (Single row in single column, full width)
  const cgpaCalc = itemMap.get("cgpa_calculator");

  // 4. Course Hub & Faculty Directory (Single row, 2 columns)
  const courseHub = itemMap.get("course_eval");
  const facultyDir = itemMap.get("faculty_directory");
  const row4Items = [courseHub, facultyDir].filter(
    (x): x is MenuItemConfig => !!x,
  );

  // Fallback for any extra items not in the primary 6
  const handledIds = new Set([
    "academic_calendar",
    "class_routines",
    "exam_routines",
    "cgpa_calculator",
    "course_eval",
    "faculty_directory",
  ]);
  const extraItems = items.filter((item) => !handledIds.has(item.id));

  type LayoutRow =
    | { type: "full"; item: MenuItemConfig }
    | { type: "pair"; left: MenuItemConfig; right?: MenuItemConfig };

  const rows: LayoutRow[] = [];

  if (academicCal) {
    rows.push({ type: "full", item: academicCal });
  }

  if (row2Items.length === 2) {
    rows.push({ type: "pair", left: row2Items[0], right: row2Items[1] });
  } else if (row2Items.length === 1) {
    rows.push({ type: "full", item: row2Items[0] });
  }

  if (cgpaCalc) {
    rows.push({ type: "full", item: cgpaCalc });
  }

  if (row4Items.length === 2) {
    rows.push({ type: "pair", left: row4Items[0], right: row4Items[1] });
  } else if (row4Items.length === 1) {
    rows.push({ type: "full", item: row4Items[0] });
  }

  for (let i = 0; i < extraItems.length; i += 2) {
    if (extraItems[i + 1]) {
      rows.push({ type: "pair", left: extraItems[i], right: extraItems[i + 1] });
    } else {
      rows.push({ type: "full", item: extraItems[i] });
    }
  }

  return (
    <View style={grid.container}>
      {rows.map((row, idx) => (
        <View
          key={
            row.type === "full"
              ? row.item.id
              : `${row.left.id}-${row.right?.id}`
          }
          style={[grid.row, idx > 0 && grid.rowGap]}
        >
          {row.type === "full" ? (
            <FeatureCard item={row.item} fullWidth />
          ) : row.right ? (
            <>
              <FeatureCard item={row.left} />
              <FeatureCard item={row.right} />
            </>
          ) : (
            <FeatureCard item={row.left} fullWidth />
          )}
        </View>
      ))}
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

  // Category ordering — for ADMIN, show ADMINISTRATION first!
  const categoryOrder = useMemo(() => {
    if (userRole === "ADMIN") {
      return ["ADMIN", "ACADEMIC", "CAMPUS", "SUPPORT"] as const;
    }
    return DEFAULT_CATEGORY_ORDER;
  }, [userRole]);

  // Filter by role then group by category
  const sections = useMemo(() => {
    const role = userRole || "STUDENT";
    const filtered = ALL_MENU_ITEMS.filter((item) => item.roles.includes(role));
    return groupByCategory(filtered, categoryOrder);
  }, [userRole, categoryOrder]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <ExploreHeader roleBadgeText={roleBadgeText} />

      {/* ── Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 132,
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

            {/* Feature Cards */}
            {section.category === "ACADEMIC" && userRole !== "ADMIN" ? (
              <AcademicGridSection items={section.items} />
            ) : (
              <GridSection items={section.items} />
            )}
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
