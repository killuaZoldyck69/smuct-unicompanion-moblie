import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAvailableTeachersInfinite } from "@/features/hubs/useHubs";
import TeacherProfileModal, { Teacher } from "./teacher-profile-modal";

export type { Teacher };

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  teachers?: Teacher[];
  isLoading?: boolean;
}

const BENTO_COLORS = {
  canvas: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  borderLight: "rgba(19, 27, 46, 0.08)",
  blueSoft: "#d0e4ff",
  blueDark: "#1e3a8a",
  mintSoft: "#c3f0d2",
  mintDark: "#065f46",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export default function SearchableTeacherSelect({
  selectedId,
  onSelect,
  teachers: initialTeachers = [],
  isLoading: isParentLoading = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherObj, setSelectedTeacherObj] = useState<Teacher | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading: isQueryLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useAvailableTeachersInfinite({
    search: debouncedSearch,
  });

  const allLoadedTeachers: Teacher[] = useMemo(() => {
    const serverList = data?.pages.flatMap((page) => page.data) ?? [];
    return serverList.length > 0 ? serverList : initialTeachers;
  }, [data, initialTeachers]);

  const teachersList: Teacher[] = useMemo(() => {
    const query = search.trim().toLowerCase();
    const serverList = data?.pages.flatMap((page) => page.data) ?? [];

    if (debouncedSearch && debouncedSearch === search.trim()) {
      return serverList;
    }

    if (query) {
      return allLoadedTeachers.filter((t) => {
        const name = (t.name || "").toLowerCase();
        const email = (t.email || "").toLowerCase();
        const dept = (t.teacherProfile?.department || "").toLowerCase();
        const desig = (t.teacherProfile?.designation || "").toLowerCase();
        const room = (t.teacherProfile?.officeRoom || "").toLowerCase();
        return (
          name.includes(query) ||
          email.includes(query) ||
          dept.includes(query) ||
          desig.includes(query) ||
          room.includes(query)
        );
      });
    }

    return allLoadedTeachers;
  }, [data, debouncedSearch, search, allLoadedTeachers]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedTeacherObj(null);
      return;
    }
    const found =
      allLoadedTeachers.find((t) => t.id === selectedId) ||
      initialTeachers.find((t) => t.id === selectedId);
    if (found) {
      setSelectedTeacherObj(found);
    }
  }, [selectedId, allLoadedTeachers, initialTeachers]);

  const handleClose = () => {
    setIsVisible(false);
    setSearch("");
  };

  const handleSelect = (teacher: Teacher) => {
    setSelectedTeacherObj(teacher);
    onSelect(teacher.id);
    setIsVisible(false);
    setViewingTeacher(null);
    setSearch("");
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectorBtn,
          selectedTeacherObj && styles.selectorBtnActive,
        ]}
        onPress={() => setIsVisible(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          selectedTeacherObj
            ? `Assigned instructor: ${selectedTeacherObj.name}`
            : "Search & Assign Course Instructor"
        }
        activeOpacity={0.85}
      >
        {selectedTeacherObj ? (
          <View style={styles.selectedRow}>
            {selectedTeacherObj.image ? (
              <Image
                source={{ uri: selectedTeacherObj.image }}
                style={styles.triggerAvatar}
              />
            ) : (
              <View style={styles.triggerAvatarFallback}>
                <Text style={styles.triggerAvatarText}>
                  {selectedTeacherObj.name?.charAt(0)?.toUpperCase() || "T"}
                </Text>
              </View>
            )}
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedTeacherName} numberOfLines={1}>
                {selectedTeacherObj.name}
              </Text>
              <Text style={styles.selectedTeacherSub} numberOfLines={1}>
                {selectedTeacherObj.teacherProfile?.department ||
                  selectedTeacherObj.teacherProfile?.designation ||
                  "Faculty Member"}
              </Text>
            </View>
            <View style={styles.changeBadge}>
              <Feather name="repeat" size={12} color={BENTO_COLORS.deepNavy} />
              <Text style={styles.changeBadgeText}>Change</Text>
            </View>
          </View>
        ) : (
          <View style={styles.unselectedRow}>
            <View style={styles.triggerIconCircle}>
              <Feather name="user" size={18} color={BENTO_COLORS.blueDark} />
            </View>
            <View style={styles.unselectedInfo}>
              <Text style={styles.placeholderTitle}>
                {isParentLoading ? "Loading instructors..." : "Select Course Instructor"}
              </Text>
              <Text style={styles.placeholderSub}>
                Assign a teacher or search directory
              </Text>
            </View>
            <Feather
              name="chevron-down"
              size={18}
              color={BENTO_COLORS.subtleText}
            />
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent
        statusBarTranslucent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleClose}
          />

          <View
            style={[
              styles.bentoSheet,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
            accessibilityViewIsModal={true}
          >
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Select Instructor</Text>
                <Text style={styles.sheetSubtitle}>
                  Tap profile photo to preview • Tap card to assign
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close instructor selection"
              >
                <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Feather
                name="search"
                size={18}
                color={BENTO_COLORS.blueDark}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, department, designation..."
                placeholderTextColor={BENTO_COLORS.subtleText}
                value={search}
                onChangeText={setSearch}
                autoFocus={false}
                accessible={true}
                accessibilityLabel="Search instructors"
              />
              {isFetching && !isFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  color={BENTO_COLORS.blueDark}
                  style={styles.searchStatus}
                />
              ) : !!search ? (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  style={styles.searchClearBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search text"
                >
                  <Feather
                    name="x-circle"
                    size={16}
                    color={BENTO_COLORS.subtleText}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={teachersList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
              ListEmptyComponent={
                isQueryLoading || (isFetching && teachersList.length === 0) ? (
                  <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={BENTO_COLORS.blueDark} />
                    <Text style={styles.emptyDesc}>Searching instructors...</Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Feather
                      name="user-x"
                      size={40}
                      color={BENTO_COLORS.subtleText}
                      style={styles.emptyIcon}
                    />
                    <Text style={styles.emptyTitle}>No Instructors Found</Text>
                    <Text style={styles.emptyDesc}>
                      {search.trim()
                        ? `No instructors match "${search.trim()}". Try another search term.`
                        : "No teachers are registered in the directory yet."}
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={BENTO_COLORS.blueDark} />
                    <Text style={styles.footerLoaderText}>
                      Loading more instructors...
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => {
                const isSelected = selectedId === item.id;
                return (
                  <View
                    style={[
                      styles.teacherBentoCard,
                      isSelected && styles.teacherBentoCardSelected,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.avatarTapWrapper}
                      onPress={() => setViewingTeacher(item)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`View full profile of ${item.name}`}
                      activeOpacity={0.8}
                    >
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.teacherAvatarImage}
                        />
                      ) : (
                        <View style={styles.teacherAvatarFallback}>
                          <Text style={styles.teacherAvatarFallbackText}>
                            {item.name?.charAt(0)?.toUpperCase() || "T"}
                          </Text>
                        </View>
                      )}
                      <View style={styles.viewProfileBadge}>
                        <Feather name="eye" size={9} color="#ffffff" />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.teacherContentWrapper}
                      onPress={() => handleSelect(item)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Assign ${item.name}`}
                      activeOpacity={0.7}
                    >
                      <View style={styles.nameRow}>
                        <Text style={styles.teacherNameText} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>

                      <View style={styles.metaBadgeRow}>
                        <View style={styles.designationPill}>
                          <Text style={styles.designationPillText}>
                            {item.teacherProfile?.designation || "Lecturer"}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.departmentText} numberOfLines={1}>
                        {item.teacherProfile?.department || "Faculty of Sciences"}
                      </Text>

                      {!!item.teacherProfile?.officeRoom && (
                        <View style={styles.roomRow}>
                          <Feather
                            name="map-pin"
                            size={11}
                            color={BENTO_COLORS.subtleText}
                          />
                          <Text style={styles.roomText}>
                            Room: {item.teacherProfile.officeRoom}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.assignActionBtn,
                        isSelected && styles.assignActionBtnActive,
                      ]}
                      onPress={() => handleSelect(item)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isSelected ? "Selected" : `Assign ${item.name}`
                      }
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={isSelected ? "check" : "plus"}
                        size={18}
                        color={isSelected ? "#ffffff" : BENTO_COLORS.deepNavy}
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <TeacherProfileModal
        teacher={viewingTeacher}
        onClose={() => setViewingTeacher(null)}
        onAssign={handleSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  selectorBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  selectorBtnActive: {
    borderColor: BENTO_COLORS.blueDark,
    backgroundColor: "#f8faff",
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  unselectedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  unselectedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  triggerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
  },
  triggerAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  triggerAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.blueDark,
    fontFamily,
  },
  triggerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  placeholderSub: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
    fontFamily,
  },
  selectedTeacherName: {
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  selectedTeacherSub: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
    fontFamily,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bentoSheet: {
    backgroundColor: BENTO_COLORS.canvas,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "88%",
    minHeight: 320,
    paddingHorizontal: 20,
    paddingTop: 8,
    width: "100%",
  },
  sheetHandleContainer: {
    alignItems: "center",
    paddingVertical: 6,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    fontFamily,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  searchStatus: {
    padding: 4,
  },
  searchClearBtn: {
    padding: 4,
  },
  listContentContainer: {
    paddingBottom: 12,
  },
  teacherBentoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  teacherBentoCardSelected: {
    borderColor: BENTO_COLORS.blueDark,
    backgroundColor: "#f4f8ff",
  },
  avatarTapWrapper: {
    position: "relative",
  },
  teacherAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  teacherAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  teacherAvatarFallbackText: {
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.blueDark,
    fontFamily,
  },
  viewProfileBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  teacherContentWrapper: {
    flex: 1,
    paddingHorizontal: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  teacherNameText: {
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  metaBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
    flexWrap: "wrap",
  },
  designationPill: {
    backgroundColor: BENTO_COLORS.mintSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  designationPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.mintDark,
    fontFamily,
  },
  departmentText: {
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    marginTop: 4,
    fontWeight: "500",
    fontFamily,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  roomText: {
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
    fontFamily,
  },
  assignActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  assignActionBtnActive: {
    backgroundColor: BENTO_COLORS.blueDark,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    fontFamily,
    textAlign: "center",
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    fontFamily,
  },
});
