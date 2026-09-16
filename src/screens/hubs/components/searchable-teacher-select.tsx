import React, { useState, useMemo } from "react";
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
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
  teacherProfile?: {
    department?: string | null;
    designation?: string | null;
    faculty?: string | null;
    officeRoom?: string | null;
    consultationHours?: string | null;
    expertiseFields?: string[] | null;
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  };
}

interface Props {
  teachers?: Teacher[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
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
  yellowSoft: "#fef08a",
  yellowDark: "#854d0e",
  pinkSoft: "#ffdad6",
  pinkDark: "#9f1239",
  lavenderSoft: "#f3e8ff",
  lavenderDark: "#581c87",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export default function SearchableTeacherSelect({
  teachers = [],
  selectedId,
  onSelect,
  isLoading,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  const safeTeachers = useMemo(
    () => (Array.isArray(teachers) ? teachers : []),
    [teachers],
  );
  const selectedTeacher = safeTeachers.find((t) => t.id === selectedId);

  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return safeTeachers;
    const lowerQ = search.trim().toLowerCase();
    return safeTeachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(lowerQ) ||
        t.teacherProfile?.department?.toLowerCase().includes(lowerQ) ||
        t.teacherProfile?.designation?.toLowerCase().includes(lowerQ),
    );
  }, [search, safeTeachers]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsVisible(false);
    setViewingTeacher(null);
    setSearch("");
  };

  const handleOpenLink = (url?: string | null) => {
    if (!url) return;
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(validUrl).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open link" });
    });
  };

  const handleCall = (phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open dialer" });
    });
  };

  const handleEmail = (email?: string | null) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open mail client" });
    });
  };

  return (
    <>
      {/* TRIGGER SELECTOR BUTTON (Bento Campus Style) */}
      <TouchableOpacity
        style={[
          styles.selectorBtn,
          selectedTeacher && styles.selectorBtnActive,
        ]}
        onPress={() => setIsVisible(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          selectedTeacher
            ? `Assigned instructor: ${selectedTeacher.name}`
            : "Search & Assign Course Instructor"
        }
        activeOpacity={0.85}
      >
        {selectedTeacher ? (
          <View style={styles.selectedRow}>
            {selectedTeacher.image ? (
              <Image
                source={{ uri: selectedTeacher.image }}
                style={styles.triggerAvatar}
              />
            ) : (
              <View style={styles.triggerAvatarFallback}>
                <Text style={styles.triggerAvatarText}>
                  {selectedTeacher.name?.charAt(0)?.toUpperCase() || "T"}
                </Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.selectedTeacherName} numberOfLines={1}>
                {selectedTeacher.name}
              </Text>
              <Text style={styles.selectedTeacherSub} numberOfLines={1}>
                {selectedTeacher.teacherProfile?.designation || "Faculty"} •{" "}
                {selectedTeacher.teacherProfile?.department || "Department"}
              </Text>
            </View>
            <View style={styles.changeBadge}>
              <Text style={styles.changeBadgeText}>Change</Text>
              <Feather
                name="chevron-down"
                size={14}
                color={BENTO_COLORS.deepNavy}
              />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderRow}>
            <View style={styles.searchIconCircle}>
              <Feather
                name="user-plus"
                size={16}
                color={BENTO_COLORS.pinkDark}
              />
            </View>
            <Text style={styles.placeholderText}>
              {isLoading ? "Loading teachers..." : "Select Course Instructor"}
            </Text>
            <Feather
              name="chevron-down"
              size={18}
              color={BENTO_COLORS.subtleText}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* SELECT INSTRUCTOR MODAL (Bento Campus Bottom Sheet) */}
      <Modal visible={isVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <SafeAreaView
            style={styles.bentoSheet}
            edges={["top"]}
            accessibilityViewIsModal={true}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Select Instructor</Text>
                <Text style={styles.sheetSubtitle}>
                  Tap profile photo to preview • Tap card to assign
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close instructor selection"
              >
                <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
            </View>

            {/* Bento Search Box */}
            <View style={styles.searchBox}>
              <Feather
                name="search"
                size={18}
                color={BENTO_COLORS.blueDark}
                style={{ marginRight: 10 }}
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
              {!!search && (
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
              )}
            </View>

            {/* Teachers List as Bento Cards */}
            <FlatList
              data={filteredTeachers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedId === item.id;
                return (
                  <View
                    style={[
                      styles.teacherBentoCard,
                      isSelected && styles.teacherBentoCardSelected,
                    ]}
                  >
                    {/* TAPPABLE PROFILE PICTURE */}
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
                      {/* View Profile Indicator Badge */}
                      <View style={styles.viewProfileBadge}>
                        <Feather name="eye" size={9} color="#ffffff" />
                      </View>
                    </TouchableOpacity>

                    {/* TEACHER DETAILS & SELECT ACTION */}
                    <TouchableOpacity
                      style={styles.teacherContentWrapper}
                      onPress={() => handleSelect(item.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${item.name} as instructor`}
                      activeOpacity={0.75}
                    >
                      <View style={styles.nameRow}>
                        <Text style={styles.teacherNameText} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>

                      {/* Pill Badge: Designation & Dept */}
                      <View style={styles.metaBadgeRow}>
                        <View style={styles.designationPill}>
                          <Text style={styles.designationPillText}>
                            {item.teacherProfile?.designation || "Faculty"}
                          </Text>
                        </View>
                        <Text style={styles.departmentText} numberOfLines={1}>
                          {item.teacherProfile?.department || "General"}
                        </Text>
                      </View>

                      {/* Office Room if available */}
                      {!!item.teacherProfile?.officeRoom && (
                        <View style={styles.extraInfoRow}>
                          <Feather
                            name="map-pin"
                            size={12}
                            color={BENTO_COLORS.subtleText}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.extraInfoText}>
                            Room: {item.teacherProfile.officeRoom}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* SELECT ACTION BUTTON */}
                    <TouchableOpacity
                      style={[
                        styles.selectActionBtn,
                        isSelected && styles.selectActionBtnSelected,
                      ]}
                      onPress={() => handleSelect(item.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isSelected ? "Selected" : `Assign ${item.name}`
                      }
                      activeOpacity={0.8}
                    >
                      {isSelected ? (
                        <Feather name="check" size={16} color="#ffffff" />
                      ) : (
                        <Feather
                          name="plus"
                          size={16}
                          color={BENTO_COLORS.deepNavy}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Feather
                      name="user-x"
                      size={24}
                      color={BENTO_COLORS.subtleText}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Instructors Found</Text>
                  <Text style={styles.emptyDesc}>
                    {search
                      ? `No teachers match "${search}". Try searching by name or department.`
                      : "No teachers are registered in the directory yet."}
                  </Text>
                </View>
              }
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* TEACHER PROFILE DETAILS MODAL (Campus Bento Card UI) */}
      <Modal
        visible={!!viewingTeacher}
        animationType="fade"
        transparent
        onRequestClose={() => setViewingTeacher(null)}
      >
        <View style={styles.profileModalOverlay}>
          <TouchableOpacity
            style={styles.profileModalBackdrop}
            activeOpacity={1}
            onPress={() => setViewingTeacher(null)}
          />

          <View style={styles.profileBentoCard}>
            {/* Top Close Row */}
            <View style={styles.profileTopRow}>
              <View style={styles.profileBadge}>
                <Feather
                  name="shield"
                  size={12}
                  color={BENTO_COLORS.blueDark}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.profileBadgeText}>Faculty Member</Text>
              </View>
              <TouchableOpacity
                onPress={() => setViewingTeacher(null)}
                style={styles.profileCloseBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close profile details"
              >
                <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {/* Profile Header Hero */}
              <View style={styles.profileHero}>
                {viewingTeacher?.image ? (
                  <Image
                    source={{ uri: viewingTeacher.image }}
                    style={styles.profileHeroAvatar}
                  />
                ) : (
                  <View style={styles.profileHeroAvatarFallback}>
                    <Text style={styles.profileHeroAvatarFallbackText}>
                      {viewingTeacher?.name?.charAt(0)?.toUpperCase() || "T"}
                    </Text>
                  </View>
                )}

                <Text style={styles.profileHeroName}>
                  {viewingTeacher?.name}
                </Text>

                <View style={styles.profileHeroPills}>
                  <View style={styles.profileDesignationPill}>
                    <Text style={styles.profileDesignationText}>
                      {viewingTeacher?.teacherProfile?.designation || "Faculty"}
                    </Text>
                  </View>
                  <Text style={styles.profileDepartmentText}>
                    {viewingTeacher?.teacherProfile?.department ||
                      "University Faculty"}
                  </Text>
                </View>
              </View>

              {/* BENTO SECTION: ACADEMIC & OFFICE DETAILS */}
              <View style={[styles.profileSectionBox, styles.sectionMint]}>
                <Text style={styles.sectionTitleMint}>CAMPUS LOCATION</Text>

                <View style={styles.infoRow}>
                  <Feather
                    name="map-pin"
                    size={15}
                    color={BENTO_COLORS.mintDark}
                    style={styles.infoRowIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoRowLabel}>Office Room</Text>
                    <Text style={styles.infoRowValue}>
                      {viewingTeacher?.teacherProfile?.officeRoom ||
                        "Not specified"}
                    </Text>
                  </View>
                </View>

                <View style={[styles.infoRow, { marginTop: 10 }]}>
                  <Feather
                    name="clock"
                    size={15}
                    color={BENTO_COLORS.mintDark}
                    style={styles.infoRowIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoRowLabel}>Consultation Hours</Text>
                    <Text style={styles.infoRowValue}>
                      {viewingTeacher?.teacherProfile?.consultationHours ||
                        "Available by appointment"}
                    </Text>
                  </View>
                </View>

                {!!viewingTeacher?.teacherProfile?.faculty && (
                  <View style={[styles.infoRow, { marginTop: 10 }]}>
                    <Feather
                      name="award"
                      size={15}
                      color={BENTO_COLORS.mintDark}
                      style={styles.infoRowIcon}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoRowLabel}>Faculty</Text>
                      <Text style={styles.infoRowValue}>
                        {viewingTeacher.teacherProfile.faculty}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* BENTO SECTION: CONTACT INFO */}
              <View style={[styles.profileSectionBox, styles.sectionBlue]}>
                <Text style={styles.sectionTitleBlue}>COMMUNICATION</Text>

                {!!viewingTeacher?.email && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handleEmail(viewingTeacher?.email)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Send email to ${viewingTeacher.email}`}
                  >
                    <Feather
                      name="mail"
                      size={15}
                      color={BENTO_COLORS.blueDark}
                      style={styles.infoRowIcon}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoRowLabel}>Email Address</Text>
                      <Text style={styles.contactValueText}>
                        {viewingTeacher.email}
                      </Text>
                    </View>
                    <Feather
                      name="arrow-up-right"
                      size={14}
                      color={BENTO_COLORS.blueDark}
                    />
                  </TouchableOpacity>
                )}

                {!!viewingTeacher?.phoneNumber && (
                  <TouchableOpacity
                    style={[styles.contactRow, { marginTop: 10 }]}
                    onPress={() => handleCall(viewingTeacher?.phoneNumber)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${viewingTeacher.phoneNumber}`}
                  >
                    <Feather
                      name="phone"
                      size={15}
                      color={BENTO_COLORS.blueDark}
                      style={styles.infoRowIcon}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoRowLabel}>Phone Number</Text>
                      <Text style={styles.contactValueText}>
                        {viewingTeacher.phoneNumber}
                      </Text>
                    </View>
                    <Feather
                      name="arrow-up-right"
                      size={14}
                      color={BENTO_COLORS.blueDark}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* BENTO SECTION: EXPERTISE FIELDS (if any) */}
              {Array.isArray(
                viewingTeacher?.teacherProfile?.expertiseFields,
              ) &&
                viewingTeacher.teacherProfile.expertiseFields.length > 0 && (
                  <View
                    style={[styles.profileSectionBox, styles.sectionLavender]}
                  >
                    <Text style={styles.sectionTitleLavender}>
                      AREAS OF EXPERTISE
                    </Text>
                    <View style={styles.expertisePillContainer}>
                      {viewingTeacher.teacherProfile.expertiseFields.map(
                        (field, idx) => (
                          <View key={idx} style={styles.expertisePill}>
                            <Text style={styles.expertisePillText}>
                              {field}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                )}

              {/* SOCIAL / ACADEMIC WEBSITES */}
              {(viewingTeacher?.teacherProfile?.linkedInUrl ||
                viewingTeacher?.teacherProfile?.personalWebsiteUrl) && (
                <View style={styles.linksRow}>
                  {!!viewingTeacher?.teacherProfile?.linkedInUrl && (
                    <TouchableOpacity
                      style={styles.socialLinkBtn}
                      onPress={() =>
                        handleOpenLink(
                          viewingTeacher?.teacherProfile?.linkedInUrl,
                        )
                      }
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Open LinkedIn Profile"
                    >
                      <Feather
                        name="linkedin"
                        size={14}
                        color={BENTO_COLORS.deepNavy}
                      />
                      <Text style={styles.socialLinkText}>LinkedIn</Text>
                    </TouchableOpacity>
                  )}
                  {!!viewingTeacher?.teacherProfile?.personalWebsiteUrl && (
                    <TouchableOpacity
                      style={styles.socialLinkBtn}
                      onPress={() =>
                        handleOpenLink(
                          viewingTeacher?.teacherProfile?.personalWebsiteUrl,
                        )
                      }
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Open Website"
                    >
                      <Feather
                        name="globe"
                        size={14}
                        color={BENTO_COLORS.deepNavy}
                      />
                      <Text style={styles.socialLinkText}>Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>

            {/* PRIMARY ACTION: ASSIGN INSTRUCTOR */}
            <TouchableOpacity
              style={styles.profileAssignBtn}
              onPress={() => {
                if (viewingTeacher) handleSelect(viewingTeacher.id);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Assign ${viewingTeacher?.name} as Course Instructor`}
              activeOpacity={0.85}
            >
              <Feather
                name="check-circle"
                size={18}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.profileAssignBtnText}>
                Assign as Course Instructor
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Trigger Selector Box
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
  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BENTO_COLORS.pinkSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  placeholderText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    fontFamily,
    color: BENTO_COLORS.subtleText,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  triggerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  triggerAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 12,
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

  // Modal Sheet (Bento Campus)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "flex-end",
  },
  bentoSheet: {
    backgroundColor: BENTO_COLORS.canvas,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "88%",
    paddingHorizontal: 20,
    paddingTop: 8,
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

  // Search Box
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  searchClearBtn: {
    padding: 4,
  },

  // Teacher Card (Bento Style)
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
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    fontFamily,
    flexShrink: 1,
  },
  extraInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  extraInfoText: {
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    fontFamily,
  },
  selectActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO_COLORS.canvas,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  selectActionBtnSelected: {
    backgroundColor: BENTO_COLORS.blueDark,
    borderColor: BENTO_COLORS.blueDark,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  emptyDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
    fontFamily,
  },

  // PROFILE DETAILS MODAL
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileBentoCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 10,
  },
  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.blueDark,
    fontFamily,
  },
  profileCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileHero: {
    alignItems: "center",
    marginBottom: 18,
  },
  profileHeroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
    marginBottom: 12,
  },
  profileHeroAvatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: BENTO_COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileHeroAvatarFallbackText: {
    fontSize: 36,
    fontWeight: "800",
    color: BENTO_COLORS.blueDark,
    fontFamily,
  },
  profileHeroName: {
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
    textAlign: "center",
  },
  profileHeroPills: {
    alignItems: "center",
    marginTop: 6,
  },
  profileDesignationPill: {
    backgroundColor: BENTO_COLORS.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  profileDesignationText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.mintDark,
    fontFamily,
  },
  profileDepartmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    fontFamily,
    textAlign: "center",
  },

  // Bento Boxes inside Profile
  profileSectionBox: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  sectionMint: {
    backgroundColor: "#e8f8ee",
  },
  sectionTitleMint: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.mintDark,
    letterSpacing: 0.8,
    marginBottom: 10,
    fontFamily,
  },
  sectionBlue: {
    backgroundColor: "#eef5ff",
  },
  sectionTitleBlue: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.blueDark,
    letterSpacing: 0.8,
    marginBottom: 10,
    fontFamily,
  },
  sectionLavender: {
    backgroundColor: "#f5efff",
  },
  sectionTitleLavender: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.lavenderDark,
    letterSpacing: 0.8,
    marginBottom: 10,
    fontFamily,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoRowIcon: {
    marginRight: 10,
  },
  infoRowLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    fontFamily,
  },
  infoRowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
    marginTop: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.blueDark,
    fontFamily,
    marginTop: 1,
  },

  // Expertise Pills
  expertisePillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  expertisePill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(88, 28, 135, 0.1)",
  },
  expertisePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.lavenderDark,
    fontFamily,
  },

  // Social Links
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  socialLinkBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: BENTO_COLORS.canvas,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  socialLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },

  // Primary Assign Action Button
  profileAssignBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 9999,
    paddingVertical: 14,
    marginTop: 8,
  },
  profileAssignBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    fontFamily,
  },
});

