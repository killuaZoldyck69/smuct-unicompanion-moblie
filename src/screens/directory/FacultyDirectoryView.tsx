import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useInfiniteTeachersDirectory,
  useTeacherDepartments,
} from "@/features/directory/useDirectory";
import { TeacherDirectoryItem } from "@/services/directory-service";
import { THEME, fontFamily } from "./constants";
import { AmbientBackground } from "./components/AmbientBackground";
import { DirectoryHeader } from "./components/DirectoryHeader";
import { ActiveFiltersBar } from "./components/ActiveFiltersBar";
import { DirectoryFilterModal } from "./components/DirectoryFilterModal";
import { TeacherCard } from "./components/TeacherCard";
import { TeacherDetailModal } from "./components/TeacherDetailModal";
import { TeacherDirectorySkeleton } from "./components/TeacherDirectorySkeleton";
import { TeacherDirectoryEmptyState } from "./components/TeacherDirectoryEmptyState";

export interface FacultyDirectoryViewProps {
  onClose?: () => void;
  isModal?: boolean;
  initialDepartment?: string | null;
}

export const FacultyDirectoryView: React.FC<FacultyDirectoryViewProps> = React.memo(
  ({ onClose, isModal = false, initialDepartment = null }) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
      initialDepartment,
    );
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Selected teacher for full-screen detail modal
    const [selectedTeacher, setSelectedTeacher] =
      useState<TeacherDirectoryItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Edge-to-edge transparent status bar on screen focus
    useFocusEffect(
      useCallback(() => {
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("transparent", true);
          StatusBar.setTranslucent(true);
        }
      }, []),
    );

    // Debounce search query by 350ms to minimize network traffic
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery.trim());
      }, 350);

      return () => clearTimeout(timer);
    }, [searchQuery]);

    // Query 1: Active distinct departments for filter chips
    const { data: departments = [] } = useTeacherDepartments();

    // Query 2: Server-side infinite paginated teachers directory
    const {
      data,
      isLoading,
      isError,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      refetch,
      isRefetching,
    } = useInfiniteTeachersDirectory({
      search: debouncedSearch,
      department:
        selectedDepartment && selectedDepartment !== "All"
          ? selectedDepartment
          : undefined,
      limit: 15,
    });

    // Flatten pages into a single items array
    const allTeachers = useMemo(() => {
      if (!data?.pages) return [];
      return data.pages.flatMap((page) => page.data);
    }, [data]);

    // Total count from metadata
    const totalCount = data?.pages?.[0]?.meta?.total ?? allTeachers.length;

    // Callbacks
    const handleBack = useCallback(() => {
      if (onClose) {
        onClose();
      } else if (router.canGoBack()) {
        router.back();
      }
    }, [onClose, router]);

    const handleSelectTeacher = useCallback((teacher: TeacherDirectoryItem) => {
      setSelectedTeacher(teacher);
      setIsDetailOpen(true);
    }, []);

    const handleCloseDetail = useCallback(() => {
      setIsDetailOpen(false);
      // Wait for modal animation to settle before clearing object
      setTimeout(() => setSelectedTeacher(null), 300);
    }, []);

    const handleResetFilters = useCallback(() => {
      setSearchQuery("");
      setDebouncedSearch("");
      setSelectedDepartment(null);
      setIsFilterModalOpen(false);
    }, []);

    // Pagination trigger
    const handleEndReached = useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Memoized User Card item renderer
    const renderItem = useCallback(
      ({ item, index }: { item: TeacherDirectoryItem; index: number }) => (
        <TeacherCard
          teacher={item}
          index={index}
          onPress={handleSelectTeacher}
        />
      ),
      [handleSelectTeacher],
    );

    const keyExtractor = useCallback(
      (item: TeacherDirectoryItem) => item.id,
      [],
    );

    // List footer component for infinite scroll loading spinner
    const renderListFooter = useCallback(() => {
      if (isFetchingNextPage) {
        return (
          <View style={styles.listFooterLoading}>
            <ActivityIndicator size="small" color={THEME.primary} />
            <Text style={styles.listFooterLoadingText}>
              Loading more faculty members...
            </Text>
          </View>
        );
      }

      if (allTeachers.length > 0 && !hasNextPage) {
        return (
          <View style={styles.listFooterEnd}>
            <Text style={styles.listFooterEndText}>
              Showing all {totalCount} {totalCount === 1 ? "faculty member" : "faculty members"}
            </Text>
          </View>
        );
      }

      return <View style={{ height: 24 }} />;
    }, [isFetchingNextPage, allTeachers.length, hasNextPage, totalCount]);

    const hasActiveFilters = Boolean(
      debouncedSearch.length > 0 ||
        (selectedDepartment && selectedDepartment !== "All"),
    );

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        {/* Dynamic Ambient Background Shapes matching Admin Directory */}
        <AmbientBackground topInset={insets.top} />

        <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
          {/* Header Block with Back Action & Integrated Search + Filter Bar */}
          <DirectoryHeader
            searchQuery={searchQuery}
            debouncedSearch={debouncedSearch}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            hasActiveFilters={Boolean(
              selectedDepartment && selectedDepartment !== "All",
            )}
            totalCount={totalCount}
            onBack={onClose || isModal || router.canGoBack() ? handleBack : undefined}
            isModal={isModal}
          />

          {/* Active Filter Indicators Bar */}
          <ActiveFiltersBar
            selectedDepartment={selectedDepartment}
            onClearDepartment={() => setSelectedDepartment(null)}
            onClearAll={handleResetFilters}
          />

          {/* Main List / Skeleton / Error / Empty States */}
          {isLoading && allTeachers.length === 0 ? (
            <TeacherDirectorySkeleton />
          ) : isError ? (
            <TeacherDirectoryEmptyState
              hasFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
              isError={true}
              onRetry={refetch}
            />
          ) : allTeachers.length === 0 ? (
            <TeacherDirectoryEmptyState
              hasFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          ) : (
            <FlatList
              data={allTeachers}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
              ListFooterComponent={renderListFooter}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching && !isFetchingNextPage}
                  onRefresh={refetch}
                  colors={[THEME.primary]}
                  tintColor={THEME.primary}
                />
              }
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
            />
          )}
        </View>

        {/* Quick Department Filter Bottom Sheet Modal */}
        <DirectoryFilterModal
          visible={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={(dept) => {
            setSelectedDepartment(dept);
            setIsFilterModalOpen(false);
          }}
          onResetAll={handleResetFilters}
          topInset={insets.top}
          bottomInset={insets.bottom}
          activeDepartments={departments}
        />

        {/* Full-Screen Teacher Detail Modal matching Admin Teacher Profile */}
        <TeacherDetailModal
          teacher={selectedTeacher}
          visible={isDetailOpen}
          onClose={handleCloseDetail}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  mainWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  listFooterLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  listFooterLoadingText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textSecondary,
  },
  listFooterEnd: {
    alignItems: "center",
    paddingVertical: 20,
  },
  listFooterEndText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textMuted,
  },
});
