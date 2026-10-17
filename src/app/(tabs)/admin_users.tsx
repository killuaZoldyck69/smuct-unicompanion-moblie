import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "@/services/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getDepartmentShortName, getDepartmentFullName } from "@/data/programs";

type TabType = "STUDENT" | "TEACHER";

// --- Theme Tokens matching uploaded mockup ---
const THEME = {
  bg: "#F8FAFC",
  headerBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  cardBorder: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  inputBg: "#FFFFFF",
  inputBorder: "#E2E8F0",
  // Students Active Colors
  studentPrimary: "#00875A",
  studentPrimaryBg: "#ECFDF5",
  studentPillActive: "#00875A",
  studentPillInactive: "#EFF6FF",
  // Teachers Active Colors
  teacherPrimary: "#4338CA",
  teacherPrimaryBg: "#EEF2FF",
  teacherPillActive: "#6366F1",
  teacherPillInactive: "#EDE9FE",
  // Badges
  crBadgeBg: "#FEF08A",
  crBadgeText: "#854D0E",
  taBadgeBg: "#DCFCE7",
  taBadgeText: "#166534",
};

// Pastel container palettes for avatars (matching screenshot alternating soft cards)
const AVATAR_PASTELS = [
  { bg: "#E6F9F2", border: "#C1F0DF" }, // Mint / Emerald
  { bg: "#EFF6FF", border: "#DBEAFE" }, // Soft Sky Blue
  { bg: "#F5F3FF", border: "#EDE9FE" }, // Soft Lavender
  { bg: "#FFFBEB", border: "#FEF3C7" }, // Soft Butter Yellow / Peach
  { bg: "#FFF1F2", border: "#FFE4E6" }, // Soft Rose
];

// --- Memoized User Card Component for High UI Scroll & Memory Performance ---
interface UserCardProps {
  item: any;
  index: number;
  activeTab: TabType;
  onPress: (user: any) => void;
}

const UserCard = React.memo(
  ({ item, index, activeTab, onPress }: UserCardProps) => {
    const profile =
      activeTab === "STUDENT" ? item.studentProfile : item.teacherProfile;
    const identifier =
      activeTab === "STUDENT" ? profile?.studentId : profile?.teacherId;
    const isCR = profile?.isCR;
    const isTA = profile?.isTA;
    const pastel = AVATAR_PASTELS[index % AVATAR_PASTELS.length];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => onPress(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`User: ${item.name}, ${profile?.department || "No Dept"}`}
      >
        {/* Pastel Avatar Container */}
        <View
          style={[
            styles.avatarBox,
            { backgroundColor: pastel.bg, borderColor: pastel.border },
          ]}
        >
          {item.image ? (
            <View style={styles.avatarImageWrapper}>
              <Image
                source={{ uri: item.image }}
                style={styles.avatarImage}
                accessible={true}
                accessibilityLabel={`${item.name}'s profile photo`}
              />
            </View>
          ) : (
            <View style={styles.avatarFallbackCircle}>
              <Text style={styles.avatarFallbackLetter}>
                {item.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>

        {/* User Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name}
            </Text>
            {isCR && (
              <View style={styles.badgeCR}>
                <Text style={styles.badgeTextCR}>CR</Text>
              </View>
            )}
            {isTA && (
              <View style={styles.badgeTA}>
                <Text style={styles.badgeTextTA}>TA</Text>
              </View>
            )}
          </View>

          <Text style={styles.userInfo} numberOfLines={1}>
            {identifier || "No ID"} •{" "}
            {getDepartmentShortName(profile?.department)}
          </Text>
        </View>

        {/* Right Arrow */}
        <Feather name="chevron-right" size={18} color={THEME.textMuted} />
      </TouchableOpacity>
    );
  },
);

export default function AdminManageUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { role, isPending, isAuthenticated } = useCurrentUser();

  // Ensure seamless edge-to-edge status bar on Android & iOS
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent", true);
        StatusBar.setTranslucent(true);
      }
    }, []),
  );

  useEffect(() => {
    if (!isPending && (!isAuthenticated || role !== "ADMIN")) {
      router.replace("/(tabs)");
    }
  }, [isPending, isAuthenticated, role, router]);

  const [activeTab, setActiveTab] = useState<TabType>("STUDENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterRoleTag, setFilterRoleTag] = useState<"ALL" | "CR" | "TA">("ALL");

  // Debounce search input by 350ms to minimize network traffic and database load
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- Server-side Infinite Query with Debounced Search, Filtering, and Caching ---
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: [
      "adminUsers",
      "infinite",
      {
        role: activeTab,
        department: selectedDepartment || "All",
        tag: activeTab === "STUDENT" ? filterRoleTag : "ALL",
        search: debouncedSearch,
      },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = {
        page: pageParam,
        limit: 20,
        role: activeTab,
      };
      if (selectedDepartment && selectedDepartment !== "All") {
        params.department = selectedDepartment;
      }
      if (activeTab === "STUDENT" && filterRoleTag !== "ALL") {
        params.tag = filterRoleTag;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await api.get("/users", { params });
      return {
        users: response.data?.data || [],
        meta: response.data?.meta || {
          page: pageParam,
          total: 0,
          totalPages: 1,
          hasMore: false,
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasMore) {
        return (lastPage.meta.page as number) + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache validity
    gcTime: 1000 * 60 * 10, // 10 minutes memory garbage collection
    placeholderData: (previousData) => previousData, // Seamless transitions between filters
  });

  // Flatten all paginated pages into single list
  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) || [];
  }, [data]);

  // --- Mutations ---
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => await api.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      Toast.show({ type: "success", text1: "Account Deleted" });
      setSelectedUser(null);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Delete Failed", text2: err.message }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string;
      action: "MAKE_CR" | "MAKE_TA" | "REMOVE_ROLE";
    }) => {
      return await api.patch(`/users/${userId}/role`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      Toast.show({ type: "success", text1: "User Role Updated" });
      setSelectedUser(null);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  // --- Action Handlers ---
  const handleDelete = (userId: string, name: string) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Are you sure you want to permanently delete ${name}'s account?`,
        )
      ) {
        deleteUserMutation.mutate(userId);
      }
    } else {
      Alert.alert(
        "Delete Account",
        `Are you sure you want to permanently delete ${name}? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteUserMutation.mutate(userId),
          },
        ],
      );
    }
  };

  const handleUpdateRole = (
    userId: string,
    action: "MAKE_CR" | "MAKE_TA" | "REMOVE_ROLE",
  ) => {
    updateRoleMutation.mutate({ userId, action });
  };

  // --- Department list for filter modal ---
  const departmentChips = useMemo(() => {
    return [
      "All",
      "CSE",
      "CSIT",
      "AMMT",
      "FDT",
      "IA",
      "GDM",
      "ARCH",
      "BBA",
      "ENG",
      "LAW",
      "SOC",
      "BAN",
      "G&P",
      "IS",
      "FA",
      "MUS",
      "DAN",
    ];
  }, []);

  // --- Memoized Render User Card for Virtualized FlatList ---
  const renderUserCard = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <UserCard
        item={item}
        index={index}
        activeTab={activeTab}
        onPress={setSelectedUser}
      />
    ),
    [activeTab],
  );

  // --- Infinite Scroll Handlers ---
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- Active Tab Theme Helpers ---
  const isStudentTab = activeTab === "STUDENT";
  const primaryThemeColor = isStudentTab
    ? THEME.studentPrimary
    : THEME.teacherPrimary;

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
  }, [
    isFetchingNextPage,
    users.length,
    hasNextPage,
    isStudentTab,
    primaryThemeColor,
  ]);

  if (isPending || role !== "ADMIN") {
    return (
      <View style={styles.loadingFullContainer}>
        <ActivityIndicator size="large" color={THEME.studentPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Dynamic Ambient Background Shapes (matching screenshot top corner aesthetics) */}
      <View
        pointerEvents="none"
        style={[
          styles.ambientTopLeft,
          {
            backgroundColor: isStudentTab ? "#EDE9FE" : "#EDE9FE",
            opacity: isStudentTab ? 0.75 : 0.85,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ambientTopRight,
          {
            top: insets.top + 4,
            backgroundColor: isStudentTab ? "#D1FAE5" : "#FEF3C7",
            opacity: isStudentTab ? 0.8 : 0.85,
          },
        ]}
      />

      <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
        {/* Header Block */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>User Directory</Text>
          <Text style={styles.headerSubtitle}>
            Find and connect with people at SMUCT
          </Text>

          {/* Search & Sliders Filter Bar */}
          <View style={styles.searchBarContainer}>
            <Feather
              name="search"
              size={19}
              color={THEME.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, or email..."
              placeholderTextColor={THEME.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              accessible={true}
              accessibilityLabel="Search by name, ID, or email"
            />
            {searchQuery !== debouncedSearch ? (
              <ActivityIndicator
                size="small"
                color={primaryThemeColor}
                style={{ marginRight: 6 }}
              />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearSearchBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
              >
                <Feather name="x-circle" size={16} color={THEME.textMuted} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => setIsFilterModalOpen(true)}
              style={styles.slidersButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Filter user directory"
            >
              <Feather
                name="sliders"
                size={18}
                color={
                  selectedDepartment || (isStudentTab && filterRoleTag !== "ALL")
                    ? primaryThemeColor
                    : THEME.textSecondary
                }
              />
              {(selectedDepartment ||
                (isStudentTab && filterRoleTag !== "ALL")) && (
                <View
                  style={[
                    styles.filterBadgeDot,
                    { backgroundColor: primaryThemeColor },
                  ]}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Tab Switcher (Students vs Teachers) */}
        <View style={styles.tabsRow}>
          {/* Students Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab("STUDENT");
              setSelectedDepartment(null);
            }}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Students directory tab"
          >
            <View style={styles.tabContentRow}>
              <Ionicons
                name="person"
                size={18}
                color={isStudentTab ? THEME.studentPrimary : THEME.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isStudentTab && {
                    color: THEME.studentPrimary,
                    fontWeight: "700",
                  },
                ]}
              >
                Students
              </Text>
            </View>
            {isStudentTab && (
              <View
                style={[
                  styles.activeTabUnderline,
                  { backgroundColor: THEME.studentPrimary },
                ]}
              />
            )}
          </TouchableOpacity>

          {/* Teachers Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab("TEACHER");
              setSelectedDepartment(null);
            }}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Teachers directory tab"
          >
            <View style={styles.tabContentRow}>
              <FontAwesome5
                name="graduation-cap"
                size={17}
                color={!isStudentTab ? THEME.teacherPrimary : THEME.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  !isStudentTab && {
                    color: THEME.teacherPrimary,
                    fontWeight: "700",
                  },
                ]}
              >
                Teachers
              </Text>
            </View>
            {!isStudentTab && (
              <View
                style={[
                  styles.activeTabUnderline,
                  { backgroundColor: THEME.teacherPrimary },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Indicators */}
        {(selectedDepartment ||
          (isStudentTab && filterRoleTag !== "ALL")) && (
          <View style={styles.activeFilterRow}>
            {selectedDepartment && (
              <View style={styles.activeFilterPill}>
                <Feather
                  name="filter"
                  size={12}
                  color={primaryThemeColor}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.activeFilterText}>
                  Dept: {selectedDepartment}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedDepartment(null)}
                  style={styles.activeFilterRemoveBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear department filter"
                >
                  <Feather name="x" size={13} color={THEME.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {isStudentTab && filterRoleTag !== "ALL" && (
              <View style={styles.activeFilterPill}>
                <Feather
                  name="user-check"
                  size={12}
                  color={primaryThemeColor}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.activeFilterText}>
                  {filterRoleTag === "CR"
                    ? "Class Reps"
                    : "Teaching Assistants"}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilterRoleTag("ALL")}
                  style={styles.activeFilterRemoveBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear role filter"
                >
                  <Feather name="x" size={13} color={THEME.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setSelectedDepartment(null);
                setFilterRoleTag("ALL");
              }}
              style={styles.clearAllFiltersBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text
                style={[
                  styles.clearAllFiltersText,
                  { color: primaryThemeColor },
                ]}
              >
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main User List / Loading / Empty States */}
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
                onPress={() => {
                  setSearchQuery("");
                  setSelectedDepartment(null);
                  setFilterRoleTag("ALL");
                }}
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

      {/* --- QUICK FILTER MODAL (Opened from Sliders button) --- */}
      <Modal
        visible={isFilterModalOpen}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View
          style={[
            styles.modalBackdrop,
            { paddingTop: Math.max(insets.top, 24) + 16 },
          ]}
        >
          {/* Sibling touchable backdrop to dismiss on tap outside */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsFilterModalOpen(false)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close filter modal"
          />

          {/* Bottom Sheet Container */}
          <View
            style={[
              styles.filterSheet,
              {
                paddingBottom:
                  Math.max(insets.bottom, Platform.OS === "android" ? 24 : 16) +
                  12,
              },
            ]}
          >
            {/* Top Sheet Handle Bar */}
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Filter Sheet Header */}
            <View style={styles.filterSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterSheetTitle}>Filter Directory</Text>
                <Text style={styles.filterSheetSubtitle}>
                  Filter members by department and role
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFilterModalOpen(false)}
                style={styles.filterSheetClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close filter modal"
              >
                <Feather name="x" size={20} color={THEME.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Filter Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterScrollContent}
              bounces={false}
            >
              {/* Role Tag Filter for Students */}
              {isStudentTab && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionLabel}>ROLE STATUS</Text>
                  <View style={styles.filterOptionsRow}>
                    {(["ALL", "CR", "TA"] as const).map((tag) => {
                      const isActive = filterRoleTag === tag;
                      return (
                        <TouchableOpacity
                          key={tag}
                          style={[
                            styles.filterOptionBtn,
                            isActive && {
                              backgroundColor: primaryThemeColor,
                              borderColor: primaryThemeColor,
                            },
                          ]}
                          onPress={() => setFilterRoleTag(tag)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Filter by ${tag}`}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              isActive && {
                                color: "#FFFFFF",
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {tag === "ALL"
                              ? "All Students"
                              : tag === "CR"
                                ? "Class Reps (CR)"
                                : "Teaching Assistants (TA)"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Department Picker in Filter Modal */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeaderRow}>
                  <Text style={styles.filterSectionLabel}>SMUCT DEPARTMENTS</Text>
                  {selectedDepartment && selectedDepartment !== "All" && (
                    <Text
                      style={[
                        styles.filterSelectedDeptHint,
                        { color: primaryThemeColor },
                      ]}
                      numberOfLines={1}
                    >
                      {getDepartmentFullName(selectedDepartment)}
                    </Text>
                  )}
                </View>

                <View style={styles.filterGrid}>
                  {departmentChips.map((dept) => {
                    const isSelected =
                      dept === "All"
                        ? selectedDepartment === null ||
                          selectedDepartment === "All"
                        : selectedDepartment === dept;

                    return (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.filterGridItem,
                          isSelected && {
                            backgroundColor: primaryThemeColor,
                            borderColor: primaryThemeColor,
                          },
                        ]}
                        onPress={() =>
                          setSelectedDepartment(dept === "All" ? null : dept)
                        }
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Department ${dept}`}
                      >
                        <Text
                          style={[
                            styles.filterGridText,
                            isSelected && {
                              color: "#FFFFFF",
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.filterModalActions}>
              <TouchableOpacity
                style={styles.filterResetAction}
                onPress={() => {
                  setSelectedDepartment(null);
                  setFilterRoleTag("ALL");
                  setSearchQuery("");
                  setIsFilterModalOpen(false);
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Reset all filters"
              >
                <Text style={styles.filterResetText}>Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterApplyAction,
                  { backgroundColor: primaryThemeColor },
                ]}
                onPress={() => setIsFilterModalOpen(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Apply filters"
              >
                <Text style={styles.filterApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- DETAILED USER PROFILE MODAL --- */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedUser(null)}
      >
        <SafeAreaView
          style={styles.detailModalContainer}
          accessibilityViewIsModal={true}
        >
          {/* Detail Modal Header */}
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalHeaderTitle}>User Profile</Text>
            <TouchableOpacity
              onPress={() => setSelectedUser(null)}
              style={styles.detailModalCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close user profile"
            >
              <Feather name="x" size={20} color={THEME.textPrimary} />
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <ScrollView
              contentContainerStyle={styles.detailModalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Card Summary */}
              <View style={styles.detailProfileHero}>
                <View style={styles.detailAvatarWrapper}>
                  {selectedUser.image ? (
                    <Image
                      source={{ uri: selectedUser.image }}
                      style={styles.detailAvatarImg}
                    />
                  ) : (
                    <View style={styles.detailAvatarFallback}>
                      <Text style={styles.detailAvatarLetter}>
                        {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.detailUserName}>{selectedUser.name}</Text>
                <Text style={styles.detailUserEmail}>{selectedUser.email}</Text>

                <View style={styles.detailRoleBadge}>
                  <Text style={styles.detailRoleBadgeText}>
                    {selectedUser.role}
                  </Text>
                </View>
              </View>

              {/* Personal & Contact Details */}
              <View style={styles.detailSectionCard}>
                <Text style={styles.detailSectionTitle}>
                  CONTACT & PERSONAL
                </Text>
                {selectedUser.phoneNumber && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                      <Feather
                        name="phone"
                        size={15}
                        color={THEME.textSecondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.infoLabel}>Phone</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {selectedUser.phoneNumber}
                    </Text>
                  </View>
                )}
                {selectedUser.bloodGroup && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                      <Feather
                        name="droplet"
                        size={15}
                        color={THEME.textSecondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.infoLabel}>Blood Group</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {selectedUser.bloodGroup}
                    </Text>
                  </View>
                )}
                {(selectedUser.role === "STUDENT"
                  ? selectedUser.studentProfile?.linkedInUrl
                  : selectedUser.teacherProfile?.linkedInUrl) && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                      <Feather
                        name="linkedin"
                        size={15}
                        color={THEME.textSecondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.infoLabel}>LinkedIn</Text>
                    </View>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {selectedUser.role === "STUDENT"
                        ? selectedUser.studentProfile?.linkedInUrl
                        : selectedUser.teacherProfile?.linkedInUrl}
                    </Text>
                  </View>
                )}
                {(selectedUser.role === "STUDENT"
                  ? selectedUser.studentProfile?.personalWebsiteUrl
                  : selectedUser.teacherProfile?.personalWebsiteUrl) && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                      <Feather
                        name="globe"
                        size={15}
                        color={THEME.textSecondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.infoLabel}>Website</Text>
                    </View>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {selectedUser.role === "STUDENT"
                        ? selectedUser.studentProfile?.personalWebsiteUrl
                        : selectedUser.teacherProfile?.personalWebsiteUrl}
                    </Text>
                  </View>
                )}
              </View>

              {/* Academic Details */}
              <View style={styles.detailSectionCard}>
                <Text style={styles.detailSectionTitle}>
                  ACADEMIC INFORMATION
                </Text>
                {selectedUser.role === "STUDENT" ? (
                  <>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather
                          name="hash"
                          size={15}
                          color={THEME.textSecondary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.infoLabel}>Student ID</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {selectedUser.studentProfile?.studentId || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather
                          name="layers"
                          size={15}
                          color={THEME.textSecondary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.infoLabel}>Department</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {selectedUser.studentProfile?.department
                          ? `${selectedUser.studentProfile.department} (${getDepartmentShortName(selectedUser.studentProfile.department)})`
                          : "N/A"}
                      </Text>
                    </View>
                    {selectedUser.studentProfile?.program && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoRowLeft}>
                          <Feather
                            name="book"
                            size={15}
                            color={THEME.textSecondary}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.infoLabel}>Program</Text>
                        </View>
                        <Text style={styles.infoValue}>
                          {selectedUser.studentProfile.program}
                        </Text>
                      </View>
                    )}
                    {selectedUser.studentProfile?.batch && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoRowLeft}>
                          <Feather
                            name="users"
                            size={15}
                            color={THEME.textSecondary}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.infoLabel}>Batch</Text>
                        </View>
                        <Text style={styles.infoValue}>
                          {selectedUser.studentProfile.batch}
                        </Text>
                      </View>
                    )}
                    {selectedUser.studentProfile?.currentSemester && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoRowLeft}>
                          <Feather
                            name="book-open"
                            size={15}
                            color={THEME.textSecondary}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.infoLabel}>Semester</Text>
                        </View>
                        <Text style={styles.infoValue}>
                          Semester {selectedUser.studentProfile.currentSemester}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather
                          name="hash"
                          size={15}
                          color={THEME.textSecondary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.infoLabel}>Teacher ID</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {selectedUser.teacherProfile?.teacherId || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather
                          name="briefcase"
                          size={15}
                          color={THEME.textSecondary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.infoLabel}>Designation</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {selectedUser.teacherProfile?.designation || "Faculty"}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoRowLeft}>
                        <Feather
                          name="layers"
                          size={15}
                          color={THEME.textSecondary}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.infoLabel}>Department</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {selectedUser.teacherProfile?.department
                          ? `${selectedUser.teacherProfile.department} (${getDepartmentShortName(selectedUser.teacherProfile.department)})`
                          : "N/A"}
                      </Text>
                    </View>
                    {selectedUser.teacherProfile?.officeRoom && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoRowLeft}>
                          <Feather
                            name="map-pin"
                            size={15}
                            color={THEME.textSecondary}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.infoLabel}>Office Room</Text>
                        </View>
                        <Text style={styles.infoValue}>
                          {selectedUser.teacherProfile.officeRoom}
                        </Text>
                      </View>
                    )}
                    {selectedUser.teacherProfile?.consultationHours && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoRowLeft}>
                          <Feather
                            name="clock"
                            size={15}
                            color={THEME.textSecondary}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.infoLabel}>Consultation</Text>
                        </View>
                        <Text style={styles.infoValue}>
                          {selectedUser.teacherProfile.consultationHours}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Administrative Actions */}
              <View style={styles.detailAdminActions}>
                <Text style={styles.detailSectionTitle}>
                  ADMINISTRATIVE ACTIONS
                </Text>

                {selectedUser.role === "STUDENT" && (
                  <>
                    <TouchableOpacity
                      style={[styles.adminBtn, styles.adminBtnCR]}
                      onPress={() =>
                        handleUpdateRole(
                          selectedUser.id,
                          selectedUser.studentProfile?.isCR
                            ? "REMOVE_ROLE"
                            : "MAKE_CR",
                        )
                      }
                    >
                      <Feather
                        name="award"
                        size={18}
                        color="#854D0E"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.adminBtnTextCR}>
                        {selectedUser.studentProfile?.isCR
                          ? "Revoke CR Status"
                          : "Make Class Representative (CR)"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.adminBtn, styles.adminBtnTA]}
                      onPress={() =>
                        handleUpdateRole(
                          selectedUser.id,
                          selectedUser.studentProfile?.isTA
                            ? "REMOVE_ROLE"
                            : "MAKE_TA",
                        )
                      }
                    >
                      <Feather
                        name="book-open"
                        size={18}
                        color="#166534"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.adminBtnTextTA}>
                        {selectedUser.studentProfile?.isTA
                          ? "Revoke TA Status"
                          : "Make Teaching Assistant (TA)"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.adminBtn, styles.adminBtnDelete]}
                  onPress={() =>
                    handleDelete(selectedUser.id, selectedUser.name)
                  }
                  disabled={deleteUserMutation.isPending}
                >
                  <Feather
                    name="trash-2"
                    size={18}
                    color="#DC2626"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.adminBtnTextDelete}>
                    Permanently Delete Account
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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

  // Organic Ambient Shapes in Corners (exact aesthetic from screenshot)
  ambientTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 145,
    height: 120,
    borderBottomRightRadius: 85,
    borderBottomLeftRadius: 15,
  },
  ambientTopRight: {
    position: "absolute",
    right: -25,
    width: 125,
    height: 125,
    borderRadius: 62.5,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.textPrimary,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },

  // Search & Filter Bar
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.inputBg,
    borderRadius: 18,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.inputBorder,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.textPrimary,
    height: "100%",
  },
  clearSearchBtn: {
    padding: 6,
    marginRight: 4,
  },
  slidersButton: {
    padding: 6,
    marginLeft: 4,
    position: "relative",
  },
  filterBadgeDot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textPrimary,
    marginRight: 6,
  },
  activeFilterRemoveBtn: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  clearAllFiltersBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  clearAllFiltersText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Segmented Tabs Row
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginTop: 6,
    marginHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.textSecondary,
  },
  activeTabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 8,
    right: 8,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // List Content
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 130, // Clearance for bottom floating navigation bar
  },
  listFooterLoading: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  listFooterLoadingText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  listFooterEnd: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  listFooterEndText: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: "500",
  },

  // User Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImageWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
  },
  avatarFallbackCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackLetter: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textPrimary,
    flexShrink: 1,
  },
  badgeCR: {
    backgroundColor: THEME.crBadgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeTextCR: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.crBadgeText,
  },
  badgeTA: {
    backgroundColor: THEME.taBadgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeTextTA: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.taBadgeText,
  },
  userInfo: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

  // Empty & Loading States
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
    fontWeight: "700",
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  resetFiltersBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetFiltersBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Quick Filter Sheet Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "82%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  sheetHandleContainer: {
    alignItems: "center",
    paddingVertical: 6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  filterSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  filterSheetSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  filterSheetClose: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  filterScrollView: {
    flexShrink: 1,
  },
  filterScrollContent: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textSecondary,
    letterSpacing: 0.5,
  },
  filterSelectedDeptHint: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterOptionText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterGridItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterGridText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "600",
  },
  filterModalActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  filterResetAction: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  filterResetText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textSecondary,
  },
  filterApplyAction: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Detail Modal Styles
  detailModalContainer: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  detailModalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  detailModalCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  detailModalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  detailProfileHero: {
    alignItems: "center",
    marginBottom: 20,
  },
  detailAvatarWrapper: {
    marginBottom: 12,
  },
  detailAvatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  detailAvatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  detailAvatarLetter: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  detailUserName: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  detailUserEmail: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  detailRoleBadge: {
    marginTop: 10,
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailRoleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textPrimary,
    letterSpacing: 0.5,
  },
  detailSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textPrimary,
    maxWidth: "60%",
    textAlign: "right",
  },
  detailAdminActions: {
    marginTop: 8,
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  adminBtnCR: {
    backgroundColor: THEME.crBadgeBg,
  },
  adminBtnTextCR: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.crBadgeText,
  },
  adminBtnTA: {
    backgroundColor: THEME.taBadgeBg,
  },
  adminBtnTextTA: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.taBadgeText,
  },
  adminBtnDelete: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  adminBtnTextDelete: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },
});
