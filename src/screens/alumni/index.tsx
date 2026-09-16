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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAlumniList } from "@/features/alumni/useAlumni";
import { BENTO } from "./constants";
import { AlumniItem, AlumniSortOption, DepartmentOption } from "./types";
import { AlumniHeader } from "./components/alumni-header";
import { AlumniFilters } from "./components/alumni-filters";
import { AlumniCard } from "./components/alumni-card";
import { AlumniSkeletons } from "./components/alumni-skeletons";
import { AlumniProfileModal } from "./components/alumni-profile-modal";

export const AlumniScreen: React.FC = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<AlumniSortOption>("recent");

  const { data: alumniList, isLoading, isError, refetch } = useAlumniList();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu" as any);
    }
  }, [router]);

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
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const departmentOptions: DepartmentOption[] = useMemo(() => {
    if (!alumniList || alumniList.length === 0) return [];
    const depts = new Map<string, number>();
    alumniList.forEach((a) => {
      if (a.department) {
        depts.set(a.department, (depts.get(a.department) || 0) + 1);
      }
    });

    return [
      { label: "All", value: null, count: alumniList.length },
      ...Array.from(depts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dept, count]) => ({ label: dept, value: dept, count })),
    ];
  }, [alumniList]);

  const filteredAlumni = useMemo(() => {
    if (!alumniList) return [];
    let filtered = alumniList;

    if (selectedDepartment) {
      filtered = filtered.filter((a) => a.department === selectedDepartment);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((a) => {
        const nameMatch = a.name?.toLowerCase().includes(q);
        const companyMatch = a.currentCompany?.toLowerCase().includes(q);
        const positionMatch = (
          a.currentPosition ||
          a.designation ||
          a.currentRole
        )
          ?.toLowerCase()
          .includes(q);
        const batchMatch = (a.batch || a.graduationBatch)
          ?.toLowerCase()
          .includes(q);
        const skillsMatch = a.skills?.some((skill) =>
          skill.toLowerCase().includes(q),
        );
        const deptMatch = a.department?.toLowerCase().includes(q);
        const yearMatch = (a.graduationYear || a.passingYear)
          ?.toString()
          .includes(q);

        return (
          nameMatch ||
          companyMatch ||
          positionMatch ||
          batchMatch ||
          skillsMatch ||
          deptMatch ||
          yearMatch
        );
      });
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        const yearA = a.graduationYear || a.passingYear || 0;
        const yearB = b.graduationYear || b.passingYear || 0;
        if (yearB !== yearA) return yearB - yearA;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [alumniList, searchQuery, selectedDepartment, sortBy]);

  const handleSelectAlumni = useCallback((item: AlumniItem) => {
    setSelectedAlumni(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAlumni(null);
  }, []);

  const handleToggleSort = useCallback(() => {
    setSortBy((prev) => (prev === "recent" ? "name" : "recent"));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedDepartment(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: AlumniItem }) => (
      <AlumniCard item={item} onSelect={handleSelectAlumni} />
    ),
    [handleSelectAlumni],
  );

  const keyExtractor = useCallback((item: AlumniItem) => item.id, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <AlumniHeader
          totalCount={alumniList?.length}
          onBack={handleBack}
        />

        <AlumniFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={alumniList?.length || 0}
          filteredCount={filteredAlumni.length}
          sortBy={sortBy}
          onToggleSort={handleToggleSort}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={setSelectedDepartment}
          departments={departmentOptions}
          onResetFilters={handleResetFilters}
        />

        {isLoading ? (
          <AlumniSkeletons />
        ) : isError ? (
          <View style={styles.centerBox}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={32} color={BENTO.rose} />
            </View>
            <Text style={styles.errorTitle}>Failed to Load Alumni</Text>
            <Text style={styles.errorSubtitle}>
              An error occurred while connecting to the alumni service. Please
              check your connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetch()}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry loading alumni"
            >
              <Feather
                name="refresh-cw"
                size={15}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredAlumni.length === 0 ? (
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
              <Feather name="users" size={32} color={BENTO.navy} />
            </View>
            <Text style={styles.emptyTitle}>No Alumni Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim() || selectedDepartment
                ? "No graduates matched your current filters. Try changing your search query or selecting 'All'."
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
                  size={15}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.clearFiltersBtnText}>
                  Clear Search & Filters
                </Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredAlumni}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BENTO.roseBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 6,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "700",
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  clearFiltersBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearFiltersBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
