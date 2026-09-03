import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useNotices } from "@/features/notices/useNotices";
import { NoticeItem } from "@/services/notice-service";
import {
  BENTO_COLORS,
  CategoryFilterKey,
  fontFamily,
} from "./constants";
import { getNoticeCategory, isNewNotice } from "./utils";
import { NoticeCard } from "./components/notice-card";
import { NoticeHeroCard } from "./components/notice-hero-card";
import { NoticeCategoryFilters } from "./components/notice-category-filters";
import { NoticeDetailModal } from "./components/notice-detail-modal";
import {
  NoticeSkeleton,
  NoticeErrorState,
  NoticeEmptyState,
} from "./components/notice-states";

export { BENTO_COLORS, CATEGORY_THEMES } from "./constants";
export { getNoticeCategory, isImportantNotice, isNewNotice } from "./utils";

export function NoticeboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: notices, isLoading, isError, refetch } = useNotices();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleBack = useCallback(() => {
    if (selectedNotice) {
      setSelectedNotice(null);
      return;
    }
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery("");
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [selectedNotice, isSearchOpen, router]);

  useEffect(() => {
    const onHardwareBack = () => {
      if (selectedNotice || isSearchOpen) {
        handleBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [selectedNotice, isSearchOpen, handleBack]);

  const { filteredNotices, categoryCounts, newNoticeCount } = useMemo(() => {
    const list = Array.isArray(notices) ? notices : [];

    const counts: Record<string, number> = {
      ALL: list.length,
      ACADEMIC: 0,
      ADMIN: 0,
      EXAM: 0,
      HOLIDAY: 0,
      TRANSPORT: 0,
    };

    let newCount = 0;

    list.forEach((item) => {
      const cat = getNoticeCategory(item);
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      }
      if (isNewNotice(item.issueDate || item.createdAt)) {
        newCount += 1;
      }
    });

    const query = searchQuery.toLowerCase().trim();

    const filtered = list.filter((item) => {
      const cat = getNoticeCategory(item);
      const matchesCategory = selectedCategory === "ALL" || cat === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const titleMatch = (item.title || "").toLowerCase().includes(query);
      const bodyMatch = (item.body || "").toLowerCase().includes(query);
      const refMatch = (item.referenceNo || "").toLowerCase().includes(query);
      const issuerMatch = (item.issuerName || "").toLowerCase().includes(query);

      return titleMatch || bodyMatch || refMatch || issuerMatch;
    });

    return {
      filteredNotices: filtered,
      categoryCounts: counts,
      newNoticeCount: newCount,
    };
  }, [notices, selectedCategory, searchQuery]);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("ALL");
    setSearchQuery("");
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.screenTitle} numberOfLines={1}>
            Noticeboard
          </Text>
          <Text style={styles.screenSubtitle}>
            Official University Announcements
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsSearchOpen((prev) => {
              if (prev) setSearchQuery("");
              return !prev;
            });
          }}
          style={[styles.iconBtn, isSearchOpen && styles.iconBtnActive]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle notice search"
          activeOpacity={0.7}
        >
          <Feather
            name={isSearchOpen ? "x" : "search"}
            size={19}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
      >
        {isSearchOpen && (
          <View style={styles.searchWrapper}>
            <Feather
              name="search"
              size={16}
              color={BENTO_COLORS.subtleText}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by keyword, subject, or ref..."
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              accessible={true}
              accessibilityLabel="Search notices input"
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

        <NoticeHeroCard
          totalCount={categoryCounts.ALL}
          newNoticeCount={newNoticeCount}
          categoryCounts={categoryCounts}
        />

        <NoticeCategoryFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {isLoading ? (
          <NoticeSkeleton />
        ) : isError ? (
          <NoticeErrorState onRetry={refetch} />
        ) : filteredNotices.length === 0 ? (
          <NoticeEmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onReset={handleResetFilters}
          />
        ) : (
          <View style={styles.cardsContainer}>
            {filteredNotices.map((item) => (
              <NoticeCard
                key={item.id}
                item={item}
                onPress={setSelectedNotice}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
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
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  iconBtnActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  headerTitles: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  screenTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
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
  cardsContainer: {
    paddingHorizontal: 20,
  },
});
