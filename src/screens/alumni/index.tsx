import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  useAlumniInfinite,
  useAlumniDepartments,
} from "@/features/alumni/useAlumni";
import { BENTO } from "./constants";
import { AlumniItem, DepartmentOption } from "./types";
import { AlumniHeader } from "./components/alumni-header";
import { AlumniFilters } from "./components/alumni-filters";
import { AlumniCard } from "./components/alumni-card";
import { AlumniSkeletons } from "./components/alumni-skeletons";
import { AlumniProfileModal } from "./components/alumni-profile-modal";

export const AlumniScreen: React.FC = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: departmentsData, refetch: refetchDepartments } =
    useAlumniDepartments();

  const {
    data,
    isLoading,
    isError,
    refetch: refetchAlumni,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlumniInfinite({
    department: selectedDepartment,
    search: debouncedSearch,
  });

  const alumniList: AlumniItem[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.meta?.total ?? alumniList.length;

  const handleBack = useCallback(() => {
    if (selectedAlumni) {
      setSelectedAlumni(null);
      return;
    }
    router.replace("/(tabs)/menu" as any);
  }, [selectedAlumni, router]);

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [handleBack]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchAlumni(), refetchDepartments()]);
    setIsRefreshing(false);
  }, [refetchAlumni, refetchDepartments]);

  const departmentOptions: DepartmentOption[] = useMemo(() => {
    const list: DepartmentOption[] = [{ label: "All", value: null, count: 0 }];
    if (departmentsData && Array.isArray(departmentsData)) {
      departmentsData.forEach((d) => {
        if (d.department) {
          list.push({
            label: d.department,
            value: d.department,
            count: d.count,
          });
        }
      });
    }
    return list;
  }, [departmentsData]);

  const handleSelectAlumni = useCallback((item: AlumniItem) => {
    setSelectedAlumni(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAlumni(null);
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
    ({ item }: { item: AlumniItem }) => (
      <AlumniCard item={item} onSelect={handleSelectAlumni} />
    ),
    [handleSelectAlumni],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={BENTO.navy} />
      </View>
    );
  }, [isFetchingNextPage]);

  const keyExtractor = useCallback((item: AlumniItem) => item.id, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <AlumniHeader
          totalCount={totalCount}
          filteredCount={totalCount}
          onBack={handleBack}
        />

        <AlumniFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={setSelectedDepartment}
          departments={departmentOptions}
        />

        {isLoading ? (
          <AlumniSkeletons />
        ) : isError ? (
          <View style={styles.centerBox}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={22} color={BENTO.rose} />
            </View>
            <Text style={styles.errorTitle}>Unable to load alumni</Text>
            <Text style={styles.errorSubtitle}>
              Please check your connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetchAlumni()}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry loading alumni"
            >
              <Feather
                name="refresh-cw"
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : alumniList.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[BENTO.navy]}
              />
            }
          >
            <View style={styles.emptyIcon}>
              <Feather name="search" size={22} color={BENTO.slate} />
            </View>
            <Text style={styles.emptyTitle}>No alumni found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim() || selectedDepartment
                ? "Try another name, company, or department."
                : "No alumni profiles have been registered in the network yet."}
            </Text>

            {Boolean(searchQuery.trim().length > 0 || selectedDepartment !== null) ? (
              <TouchableOpacity
                style={styles.clearFiltersBtn}
                onPress={handleResetFilters}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search and filters"
              >
                <Feather
                  name="x"
                  size={14}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.clearFiltersBtnText}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        ) : (
          <FlatList
            data={alumniList}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={12}
            windowSize={7}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[BENTO.navy]}
              />
            }
          />
        )}

        <AlumniProfileModal
          alumni={selectedAlumni}
          onClose={handleCloseModal}
        />
      </View>
    </SafeAreaView>
  );
};

export default AlumniScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BENTO.roseBg,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 4,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 260,
  },
  clearFiltersBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  clearFiltersBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#ffffff",
  },
  footerLoader: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
