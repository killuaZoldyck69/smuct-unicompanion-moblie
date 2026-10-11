import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useInfiniteTeachersDirectory,
  useTeacherDepartments,
} from "@/features/directory/useDirectory";
import { TeacherDirectoryItem } from "@/services/directory-service";
import { TeacherCard } from "./components/TeacherCard";
import { TeacherDetailModal } from "./components/TeacherDetailModal";
import { TeacherSearchBar } from "./components/TeacherSearchBar";
import { DepartmentFilterChips } from "./components/DepartmentFilterChips";
import { TeacherDirectoryHeader } from "./components/TeacherDirectoryHeader";
import { TeacherDirectorySkeleton } from "./components/TeacherDirectorySkeleton";
import { TeacherDirectoryEmptyState } from "./components/TeacherDirectoryEmptyState";
import { DIRECTORY_COLORS, fontFamily } from "./constants";

export interface FacultyDirectoryViewProps {
  onClose?: () => void;
  isModal?: boolean;
  initialDepartment?: string | null;
}

export const FacultyDirectoryView: React.FC<FacultyDirectoryViewProps> = React.memo(
  ({ onClose, isModal = false, initialDepartment = null }) => {
    const router = useRouter();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
      initialDepartment,
    );

    // Selected teacher for full-screen detail modal
    const [selectedTeacher, setSelectedTeacher] =
      useState<TeacherDirectoryItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Debounce search query by 300ms for high performance & no query flooding
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery.trim());
      }, 300);

      return () => clearTimeout(timer);
    }, [searchQuery]);

    // Query 1: Active departments for filter chips
    const { data: departments = [] } = useTeacherDepartments();

    // Query 2: Infinite paginated teachers directory
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
      department: selectedDepartment || undefined,
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
      } else {
        router.back();
      }
    }, [onClose, router]);

    const handleSelectTeacher = useCallback((teacher: TeacherDirectoryItem) => {
      setSelectedTeacher(teacher);
      setIsDetailOpen(true);
    }, []);

    const handleCloseDetail = useCallback(() => {
      setIsDetailOpen(false);
      // Let modal animation finish before clearing object
      setTimeout(() => setSelectedTeacher(null), 300);
    }, []);

    const handleResetFilters = useCallback(() => {
      setSearchQuery("");
      setDebouncedSearch("");
      setSelectedDepartment(null);
    }, []);

    const handleEndReached = useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderItem = useCallback(
      ({ item }: { item: TeacherDirectoryItem }) => (
        <TeacherCard teacher={item} onPress={handleSelectTeacher} />
      ),
      [handleSelectTeacher],
    );

    const keyExtractor = useCallback(
      (item: TeacherDirectoryItem) => item.id,
      [],
    );

    // Footer renderer for infinite scroll loading spinner
    const renderListFooter = useCallback(() => {
      if (isFetchingNextPage) {
        return (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={DIRECTORY_COLORS.blueBadge} />
            <Text style={styles.footerLoaderText}>Loading more faculty...</Text>
          </View>
        );
      }

      if (allTeachers.length > 0 && !hasNextPage) {
        return (
          <View style={styles.endOfListWrapper}>
            <Text style={styles.endOfListText}>
              Showing all {totalCount} {totalCount === 1 ? "faculty member" : "faculty members"}
            </Text>
          </View>
        );
      }

      return <View style={{ height: 24 }} />;
    }, [isFetchingNextPage, allTeachers.length, hasNextPage, totalCount]);

    const hasActiveFilters = Boolean(
      debouncedSearch.length > 0 || selectedDepartment !== null,
    );

    return (
      <View style={styles.container}>
        {/* Header Bar */}
        <TeacherDirectoryHeader
          onBack={handleBack}
          totalCount={totalCount}
          isModal={isModal}
        />

        {/* Search Bar */}
        <TeacherSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          isSearching={debouncedSearch !== searchQuery}
        />

        {/* Department Filter Chips */}
        <DepartmentFilterChips
          departments={departments}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={setSelectedDepartment}
          totalTeachersCount={totalCount}
        />

        {/* Content Body */}
        {isLoading ? (
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
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderListFooter}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching && !isFetchingNextPage}
                onRefresh={refetch}
                colors={[DIRECTORY_COLORS.blueBadge, DIRECTORY_COLORS.tealDark]}
                tintColor={DIRECTORY_COLORS.blueBadge}
              />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === "android"}
          />
        )}

        {/* Full-Screen Teacher Detail Modal */}
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
    backgroundColor: DIRECTORY_COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  footerLoader: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerLoaderText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: DIRECTORY_COLORS.textSecondary,
  },
  endOfListWrapper: {
    paddingVertical: 20,
    alignItems: "center",
  },
  endOfListText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: DIRECTORY_COLORS.textMuted,
  },
});
