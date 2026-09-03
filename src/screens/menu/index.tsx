import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  BENTO_COLORS,
  fontFamily,
  MenuCategoryKey,
  ALL_MENU_ITEMS,
} from "./constants";
import { MenuItemCard } from "./components/menu-item-card";
import { MenuHeroCard } from "./components/menu-hero-card";
import { MenuCategoryFilters } from "./components/menu-category-filters";
import { MenuEmptyState } from "./components/menu-empty-state";

export { BENTO_COLORS, ALL_MENU_ITEMS } from "./constants";

export function Menu() {
  const insets = useSafeAreaInsets();
  const { role: userRole } = useCurrentUser();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryKey>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const accessibleItems = useMemo(() => {
    const role = userRole || "STUDENT";
    return ALL_MENU_ITEMS.filter((item) => item.roles.includes(role));
  }, [userRole]);

  const filterCategories = useMemo<MenuCategoryKey[]>(() => {
    const cats: MenuCategoryKey[] = ["ALL", "ACADEMIC", "CAMPUS", "SUPPORT"];
    if (userRole === "ADMIN") {
      cats.push("ADMIN");
    }
    return cats;
  }, [userRole]);

  const { filteredItems, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: accessibleItems.length,
      ACADEMIC: 0,
      CAMPUS: 0,
      SUPPORT: 0,
      ADMIN: 0,
    };

    accessibleItems.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });

    const query = searchQuery.toLowerCase().trim();

    const filtered = accessibleItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query)
      );
    });

    return {
      filteredItems: filtered,
      categoryCounts: counts,
    };
  }, [accessibleItems, selectedCategory, searchQuery]);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("ALL");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    const onHardwareBack = () => {
      if (isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [isSearchOpen]);

  const roleBadgeText =
    userRole === "ADMIN"
      ? "Admin Controls"
      : userRole === "TEACHER"
        ? "Faculty Tools"
        : "Student Services";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Explore Features</Text>
          <View style={styles.roleBadgeRow}>
            <View style={styles.roleBadgeDot} />
            <Text style={styles.roleBadgeText}>{roleBadgeText}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsSearchOpen((prev) => {
              if (prev) setSearchQuery("");
              return !prev;
            });
          }}
          style={[
            styles.searchToggleBtn,
            isSearchOpen && styles.searchToggleBtnActive,
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle feature search"
          activeOpacity={0.7}
        >
          <Feather
            name={isSearchOpen ? "x" : "search"}
            size={18}
            color={isSearchOpen ? BENTO_COLORS.white : BENTO_COLORS.deepNavy}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 104 : 116 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isSearchOpen && (
          <View style={styles.searchBarWrapper}>
            <Feather
              name="search"
              size={16}
              color={BENTO_COLORS.subtleText}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services (e.g. routine, notice, bus)..."
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              accessible={true}
              accessibilityLabel="Search campus services"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.searchClearBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Feather
                  name="x-circle"
                  size={16}
                  color={BENTO_COLORS.subtleText}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        <MenuHeroCard
          totalCount={accessibleItems.length}
          categoryCounts={categoryCounts}
          isAdmin={userRole === "ADMIN"}
        />

        <MenuCategoryFilters
          categories={filterCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {filteredItems.length === 0 ? (
          <MenuEmptyState
            searchQuery={searchQuery}
            onReset={handleResetFilters}
          />
        ) : (
          <View style={styles.bentoGrid}>
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </View>
        )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  headerTitleCol: {
    flex: 1,
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
    marginTop: 3,
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
  searchToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...BENTO_COLORS.shadow,
  },
  searchToggleBtnActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  scrollContent: {
    paddingTop: 6,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    ...BENTO_COLORS.shadow,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
    padding: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 12,
  },
});
