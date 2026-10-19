import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { THEME } from "./constants";
import { AdminUser } from "./types";
import { useAdminUsers } from "./hooks/use-admin-users";
import { AmbientBackground } from "./components/AmbientBackground";
import { DirectoryHeader } from "./components/DirectoryHeader";
import { DirectoryTabs } from "./components/DirectoryTabs";
import { ActiveFiltersBar } from "./components/ActiveFiltersBar";
import { UserCard } from "./components/UserCard";
import { FilterModal } from "./components/FilterModal";
import { UserProfileModal } from "./components/profile-modal/UserProfileModal";

export function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const {
    isPending,
    role,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    selectedDepartment,
    setSelectedDepartment,
    filterRoleTag,
    setFilterRoleTag,
    isFilterModalOpen,
    setIsFilterModalOpen,
    selectedUser,
    setSelectedUser,
    users,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    handleDelete,
    handleUpdateRole,
    resetFilters,
    isStudentTab,
    primaryThemeColor,
    isUpdatingRole,
    isDeletingUser,
  } = useAdminUsers();

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

  // Memoized User Card item renderer
  const renderUserCard = useCallback(
    ({ item, index }: { item: AdminUser; index: number }) => (
      <UserCard
        item={item}
        index={index}
        activeTab={activeTab}
        onPress={setSelectedUser}
      />
    ),
    [activeTab, setSelectedUser],
  );

  // Pagination trigger
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // List footer component
  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.listFooterLoading}>
          <ActivityIndicator size="small" color={primaryThemeColor} />
          <Text style={styles.listFooterLoadingText}>
            Loading more members...
          </Text>
        </View>
      );
    }
    if (users.length > 0 && !hasNextPage) {
      return (
        <View style={styles.listFooterEnd}>
          <Text style={styles.listFooterEndText}>
            Showing all {users.length} {isStudentTab ? "students" : "teachers"}
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, users.length, hasNextPage, isStudentTab, primaryThemeColor]);

  // Full loading guard
  if (isPending || role !== "ADMIN") {
    return (
      <View style={styles.loadingFullContainer}>
        <ActivityIndicator size="large" color={THEME.studentPrimary} />
      </View>
    );
  }

  const hasActiveFilters = Boolean(
    selectedDepartment || (isStudentTab && filterRoleTag !== "ALL"),
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Dynamic Ambient Background Shapes */}
      <AmbientBackground
        isStudentTab={isStudentTab}
        topInset={insets.top}
      />

      <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
        {/* Header Block with Search Bar */}
        <DirectoryHeader
          searchQuery={searchQuery}
          debouncedSearch={debouncedSearch}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          onOpenFilter={() => setIsFilterModalOpen(true)}
          hasActiveFilters={hasActiveFilters}
          primaryThemeColor={primaryThemeColor}
        />

        {/* Segmented Tab Switcher (Students vs Teachers) */}
        <DirectoryTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedDepartment(null);
          }}
        />

        {/* Active Filter Indicators */}
        <ActiveFiltersBar
          selectedDepartment={selectedDepartment}
          filterRoleTag={filterRoleTag}
          isStudentTab={isStudentTab}
          primaryThemeColor={primaryThemeColor}
          onClearDepartment={() => setSelectedDepartment(null)}
          onClearRoleTag={() => setFilterRoleTag("ALL")}
          onClearAll={resetFilters}
        />

        {/* Main List / Loading / Empty States */}
        {isLoading && users.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={primaryThemeColor} />
            <Text style={styles.loadingText}>Loading directory...</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.centerBox}>
            <View style={styles.emptyIconCircle}>
              <Feather name="users" size={36} color={THEME.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Members Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ||
              selectedDepartment ||
              (isStudentTab && filterRoleTag !== "ALL")
                ? "Try adjusting your search query or department filter."
                : `No ${isStudentTab ? "students" : "teachers"} registered yet.`}
            </Text>
            {(searchQuery.length > 0 ||
              selectedDepartment !== null ||
              (isStudentTab && filterRoleTag !== "ALL")) && (
              <TouchableOpacity
                style={[
                  styles.resetFiltersBtn,
                  { backgroundColor: primaryThemeColor },
                ]}
                onPress={resetFilters}
              >
                <Text style={styles.resetFiltersBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUserCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === "android"}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
          />
        )}
      </View>

      {/* Quick Filter Modal */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        isStudentTab={isStudentTab}
        filterRoleTag={filterRoleTag}
        onSelectRoleTag={setFilterRoleTag}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        onResetAll={() => {
          resetFilters();
          setIsFilterModalOpen(false);
        }}
        primaryThemeColor={primaryThemeColor}
        topInset={insets.top}
        bottomInset={insets.bottom}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdateRole={handleUpdateRole}
        onDelete={handleDelete}
        isUpdatingRole={isUpdatingRole}
        isDeletingUser={isDeletingUser}
        topInset={insets.top}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  mainWrapper: {
    flex: 1,
  },
  loadingFullContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.bg,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  resetFiltersBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetFiltersBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  listFooterLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  listFooterLoadingText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  listFooterEnd: {
    alignItems: "center",
    paddingVertical: 20,
  },
  listFooterEndText: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: "600",
  },
});
