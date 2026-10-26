import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useAlumniInfinite,
  useCreateAlumni,
  useUpdateAlumni,
  useDeleteAlumni,
  useBulkCreateAlumni,
} from "@/features/alumni/useAlumni";
import { BENTO, fontFamily } from "./constants";
import { AlumniItem, CreateAlumniInput } from "./types";
import { AlumniHeader } from "./components/alumni-header";
import { AlumniFilters } from "./components/alumni-filters";
import { AlumniFilterModal } from "./components/alumni-filter-modal";
import { AlumniAddChoiceModal } from "./components/alumni-add-choice-modal";
import { AlumniCard } from "./components/alumni-card";
import { AlumniSkeletons } from "./components/alumni-skeletons";
import { AlumniProfileModal } from "./components/alumni-profile-modal";
import { AlumniFormModal } from "./components/alumni-form-modal";
import { AlumniDeleteModal } from "./components/alumni-delete-modal";
import { AlumniCsvModal } from "./components/alumni-csv-modal";

export interface AlumniScreenProps {
  hasBackButton?: boolean;
  isStackScreen?: boolean;
  forceAdmin?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export const AlumniScreen: React.FC<AlumniScreenProps> = ({
  hasBackButton = false,
  forceAdmin = false,
  headerTitle = "Alumni Network",
  headerSubtitle,
}) => {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();
  const isAdmin = forceAdmin || currentUser?.role === "ADMIN";

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddChoiceModalOpen, setIsAddChoiceModalOpen] = useState(false);

  // Administrative Modals State
  const [formModalState, setFormModalState] = useState<{
    visible: boolean;
    alumni: AlumniItem | null;
  }>({
    visible: false,
    alumni: null,
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    visible: boolean;
    alumni: AlumniItem | null;
  }>({
    visible: false,
    alumni: null,
  });

  const [isCsvModalVisible, setIsCsvModalVisible] = useState(false);

  // Floating tab bar style definition to restore when modal closes
  const defaultTabBarStyle = useMemo(
    () => ({
      position: "absolute" as const,
      bottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
      marginHorizontal: 20,
      height: 68,
      backgroundColor: "#131b2e",
      borderRadius: 24,
      borderTopWidth: 0,
      elevation: 10,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      paddingBottom: 0,
      paddingTop: 0,
    }),
    [insets.bottom],
  );

  const isAnyModalOpen =
    isFilterModalOpen ||
    isAddChoiceModalOpen ||
    formModalState.visible ||
    deleteModalState.visible ||
    isCsvModalVisible ||
    Boolean(selectedAlumni);

  // Dynamically hide tab bar when ANY modal is open to fix bottom safe area overlap
  useEffect(() => {
    if (!navigation || typeof navigation.setOptions !== "function") return;

    if (isAnyModalOpen) {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: defaultTabBarStyle,
      });
    }

    return () => {
      navigation.setOptions({
        tabBarStyle: defaultTabBarStyle,
      });
    };
  }, [isAnyModalOpen, navigation, defaultTabBarStyle]);

  // Debounced search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Queries
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

  // Mutations
  const createAlumniMutation = useCreateAlumni();
  const updateAlumniMutation = useUpdateAlumni();
  const deleteAlumniMutation = useDeleteAlumni();
  const bulkCreateAlumniMutation = useBulkCreateAlumni();

  const alumniList: AlumniItem[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.meta?.total ?? alumniList.length;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchAlumni();
    setIsRefreshing(false);
  }, [refetchAlumni]);

  // Modal Triggers
  const handleSelectAlumni = useCallback((item: AlumniItem) => {
    setSelectedAlumni(item);
  }, []);

  const handleCloseProfileModal = useCallback(() => {
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

  const handleOpenCreate = useCallback(() => {
    setFormModalState({ visible: true, alumni: null });
  }, []);

  const handleOpenEdit = useCallback((item: AlumniItem) => {
    setSelectedAlumni(null);
    setFormModalState({ visible: true, alumni: item });
  }, []);

  const handleOpenDelete = useCallback((item: AlumniItem) => {
    setSelectedAlumni(null);
    setDeleteModalState({ visible: true, alumni: item });
  }, []);

  const handleOpenCsv = useCallback(() => {
    setIsCsvModalVisible(true);
  }, []);

  // Form Submission (Create or Edit)
  const handleSaveAlumni = useCallback(
    (payload: CreateAlumniInput) => {
      if (formModalState.alumni) {
        // Edit Mode
        const id = formModalState.alumni.id;
        updateAlumniMutation.mutate(
          { id, data: payload },
          {
            onSuccess: () => {
              Toast.show({
                type: "success",
                text1: "Profile Updated",
                text2: `${payload.name}'s profile was updated successfully.`,
              });
              setFormModalState({ visible: false, alumni: null });
              refetchAlumni();
            },
            onError: (err: any) => {
              const serverMsg = err?.response?.data?.message || err?.message;
              Toast.show({
                type: "error",
                text1: "Update Failed",
                text2: serverMsg || "Could not update alumni profile.",
              });
            },
          },
        );
      } else {
        // Create Mode
        createAlumniMutation.mutate(payload, {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Alumnus Added",
              text2: `${payload.name} has been added to the alumni network.`,
            });
            setFormModalState({ visible: false, alumni: null });
            refetchAlumni();
          },
          onError: (err: any) => {
            const serverMsg = err?.response?.data?.message || err?.message;
            Toast.show({
              type: "error",
              text1: "Failed to Add",
              text2: serverMsg || "Could not create alumni profile.",
            });
          },
        });
      }
    },
    [
      formModalState.alumni,
      updateAlumniMutation,
      createAlumniMutation,
      refetchAlumni,
    ],
  );

  // Deletion Confirmation
  const handleConfirmDelete = useCallback(() => {
    if (!deleteModalState.alumni) return;
    const alumniName = deleteModalState.alumni.name;
    deleteAlumniMutation.mutate(deleteModalState.alumni.id, {
      onSuccess: () => {
        Toast.show({
          type: "info",
          text1: "Alumnus Removed",
          text2: `${alumniName} was removed from the directory.`,
        });
        setDeleteModalState({ visible: false, alumni: null });
        refetchAlumni();
      },
      onError: (err: any) => {
        const serverMsg = err?.response?.data?.message || err?.message;
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: serverMsg || "Could not delete alumni profile.",
        });
      },
    });
  }, [deleteModalState.alumni, deleteAlumniMutation, refetchAlumni]);

  // Bulk CSV Import Confirmation
  const handleImportCsv = useCallback(
    (records: CreateAlumniInput[]) => {
      bulkCreateAlumniMutation.mutate(records, {
        onSuccess: (res: any) => {
          const importData = res?.data || res;
          const inserted = typeof importData?.insertedCount === "number" ? importData.insertedCount : records.length;
          const skipped = typeof importData?.skippedCount === "number" ? importData.skippedCount : 0;

          if (inserted === 0 && skipped > 0) {
            Toast.show({
              type: "info",
              text1: "Import Completed",
              text2: `All ${skipped} profile(s) were duplicates and were skipped.`,
            });
          } else {
            Toast.show({
              type: "success",
              text1: "Bulk Import Completed",
              text2:
                skipped > 0
                  ? `Successfully imported ${inserted} alumni profiles (${skipped} duplicate(s) skipped).`
                  : `Successfully imported ${inserted} alumni profiles.`,
            });
          }
          setIsCsvModalVisible(false);
          refetchAlumni();
        },
        onError: (err: any) => {
          const serverMsg = err?.response?.data?.message || err?.message;
          Toast.show({
            type: "error",
            text1: "Import Failed",
            text2: serverMsg || "Failed to bulk import alumni profiles.",
          });
        },
      });
    },
    [bulkCreateAlumniMutation, refetchAlumni],
  );

  const renderItem = useCallback(
    ({ item }: { item: AlumniItem }) => (
      <AlumniCard
        item={item}
        onSelect={handleSelectAlumni}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />
    ),
    [handleSelectAlumni, isAdmin, handleOpenEdit, handleOpenDelete],
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

  // Bottom padding factoring in floating tab bar height
  const listBottomPadding =
    72 + (insets.bottom > 0 ? insets.bottom + 16 : 24) + (isAdmin ? 48 : 20);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <AlumniHeader
          totalCount={totalCount}
          filteredCount={totalCount}
          title={headerTitle}
          subtitle={headerSubtitle}
        />

        <AlumniFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDepartment={selectedDepartment}
          onClearDepartment={() => setSelectedDepartment(null)}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
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
                <Text style={styles.clearFiltersBtnText}>Clear Filters</Text>
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
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: listBottomPadding },
            ]}
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

        {/* Floating Add Alumnus FAB Button */}
        {isAdmin && !isAnyModalOpen && (
          <TouchableOpacity
            style={[
              styles.fabAddBtn,
              {
                bottom: insets.bottom > 0 ? insets.bottom + 88 : 100,
              },
            ]}
            onPress={() => setIsAddChoiceModalOpen(true)}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add new alumnus"
          >
            <Feather name="plus" size={18} color="#ffffff" />
            <Text style={styles.fabAddText}>Add Alumnus</Text>
          </TouchableOpacity>
        )}

        {/* Add Alumnus Method Choice Modal (CSV Upload vs Manual Form) */}
        <AlumniAddChoiceModal
          visible={isAddChoiceModalOpen}
          onClose={() => setIsAddChoiceModalOpen(false)}
          onSelectCsv={() => setIsCsvModalVisible(true)}
          onSelectManualForm={handleOpenCreate}
        />

        {/* Department Filter Modal */}
        <AlumniFilterModal
          visible={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          selectedDepartment={selectedDepartment}
          onApplyDepartment={(dept) => setSelectedDepartment(dept)}
        />

        {/* Detail Modal */}
        <AlumniProfileModal
          alumni={selectedAlumni}
          onClose={handleCloseProfileModal}
          isAdmin={isAdmin}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />

        {/* Create / Edit Form Modal */}
        <AlumniFormModal
          visible={formModalState.visible}
          alumni={formModalState.alumni}
          isSaving={
            createAlumniMutation.isPending || updateAlumniMutation.isPending
          }
          onSave={handleSaveAlumni}
          onClose={() => setFormModalState({ visible: false, alumni: null })}
        />

        {/* Delete Confirmation Modal */}
        <AlumniDeleteModal
          visible={deleteModalState.visible}
          alumni={deleteModalState.alumni}
          isDeleting={deleteAlumniMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteModalState({ visible: false, alumni: null })}
        />

        {/* CSV Import Modal with Row Validation & Duplicate Detection */}
        <AlumniCsvModal
          visible={isCsvModalVisible}
          isImporting={bulkCreateAlumniMutation.isPending}
          onImport={handleImportCsv}
          onClose={() => setIsCsvModalVisible(false)}
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
    fontFamily,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 4,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 13,
    fontFamily,
    fontWeight: "400",
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
    fontFamily,
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
    fontFamily,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily,
    fontWeight: "400",
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
    fontFamily,
    fontWeight: "600",
    color: "#ffffff",
  },
  footerLoader: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fabAddBtn: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BENTO.navy,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: BENTO.navy,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabAddText: {
    fontSize: 14,
    fontFamily,
    fontWeight: "700",
    color: "#ffffff",
  },
});
