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
  Image,
  ScrollView,
  Linking,
  Platform,
  RefreshControl,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

import { useAlumniList } from "@/features/alumni/useAlumni";
import { AlumniItem } from "@/services/alumni-service";

// --- BENTO CAMPUS DESIGN SYSTEM TOKENS ---
const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  navySecondary: "#1e293b",
  slate: "#64748b",
  slateLight: "#94a3b8",
  slateSubtle: "#f1f5f9",
  border: "rgba(15, 23, 42, 0.08)",
  borderHover: "rgba(15, 23, 42, 0.16)",
  borderFocus: "#3b82f6",
  primary: "#1e3a8a",
  primaryLight: "#eff6ff",
  emerald: "#059669",
  emeraldBg: "#ecfdf5",
  emeraldBorder: "#a7f3d0",
  amber: "#d97706",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
  rose: "#dc2626",
  roseBg: "#fef2f2",
  roseBorder: "#fecaca",
  indigo: "#4338ca",
  indigoBg: "#eef2ff",
  indigoBorder: "#c7d2fe",
  purple: "#7c3aed",
  purpleBg: "#f5f3ff",
  purpleBorder: "#ddd6fe",
  fontHeading:
    Platform.OS === "web"
      ? "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
      : undefined,
  fontBody:
    Platform.OS === "web"
      ? "var(--font-body), 'Plus Jakarta Sans', system-ui, sans-serif"
      : undefined,
};

const getDeptTheme = (dept: string) => {
  const d = (dept || "").toLowerCase();
  if (d.includes("cse") || d.includes("computer")) {
    return { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca", badge: "CSE" };
  }
  if (d.includes("bba") || d.includes("business")) {
    return { bg: "#ecfdf5", border: "#a7f3d0", text: "#059669", badge: "BBA" };
  }
  if (d.includes("civil")) {
    return { bg: "#fffbeb", border: "#fde68a", text: "#d97706", badge: "Civil" };
  }
  if (d.includes("eee") || d.includes("electrical")) {
    return { bg: "#f5f3ff", border: "#ddd6fe", text: "#7c3aed", badge: "EEE" };
  }
  if (d.includes("textile")) {
    return { bg: "#fdf2f8", border: "#fbcfe8", text: "#db2777", badge: "Textile" };
  }
  if (d.includes("fashion") || d.includes("apparel")) {
    return { bg: "#fff1f2", border: "#fecdd3", text: "#e11d48", badge: "Fashion" };
  }
  return { bg: "#f1f5f9", border: "#e2e8f0", text: "#334155", badge: dept || "Alumni" };
};

export default function AlumniDirectoryScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Fetch Alumni Data ---
  const { data: alumniList, isLoading, isError, refetch } = useAlumniList();

  // --- Safe Back Navigation Handler (Bug Fix) ---
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // --- Extract Unique Departments with Counts ---
  const departmentOptions = useMemo(() => {
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

  // --- Filtering & Sorting Logic ---
  const filteredAlumni = useMemo(() => {
    if (!alumniList) return [];
    let filtered = alumniList;

    // Filter by Department
    if (selectedDepartment) {
      filtered = filtered.filter((a) => a.department === selectedDepartment);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((a) => {
        const nameMatch = a.name?.toLowerCase().includes(lowerQuery);
        const companyMatch = a.currentCompany?.toLowerCase().includes(lowerQuery);
        const positionMatch =
          (a.currentPosition || a.designation || a.currentRole)
            ?.toLowerCase()
            .includes(lowerQuery);
        const batchMatch = (a.batch || a.graduationBatch)
          ?.toLowerCase()
          .includes(lowerQuery);
        const skillsMatch = a.skills?.some((skill: string) =>
          skill.toLowerCase().includes(lowerQuery),
        );
        const deptMatch = a.department?.toLowerCase().includes(lowerQuery);

        return (
          nameMatch ||
          companyMatch ||
          positionMatch ||
          batchMatch ||
          skillsMatch ||
          deptMatch
        );
      });
    }

    // Sort by graduation year (newest first), then name
    return [...filtered].sort((a, b) => {
      const yearA = a.graduationYear || a.passingYear || 0;
      const yearB = b.graduationYear || b.passingYear || 0;
      if (yearB !== yearA) return yearB - yearA;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [alumniList, searchQuery, selectedDepartment]);

  // --- External Link & Clipboard Actions ---
  const openLink = async (url?: string | null) => {
    if (!url) return;
    try {
      let finalUrl = url.trim();
      if (
        !finalUrl.startsWith("http://") &&
        !finalUrl.startsWith("https://") &&
        !finalUrl.startsWith("mailto:")
      ) {
        finalUrl = `https://${finalUrl}`;
      }
      const supported = await Linking.canOpenURL(finalUrl);
      if (supported) {
        await Linking.openURL(finalUrl);
      } else {
        Toast.show({
          type: "error",
          text1: "Cannot Open Link",
          text2: finalUrl,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Error Opening Link",
        text2: "Unable to launch the selected link.",
      });
    }
  };

  const handleCopyEmail = async (email?: string | null) => {
    if (!email) return;
    try {
      await Clipboard.setStringAsync(email);
      Toast.show({
        type: "success",
        text1: "Email Copied",
        text2: `${email} copied to clipboard!`,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Copy Failed",
        text2: "Please copy manually.",
      });
    }
  };

  // --- Alumni Card Renderer ---
  const renderAlumniCard = ({ item }: { item: AlumniItem }) => {
    const role =
      item.currentPosition || item.designation || item.currentRole || "Alumni";
    const company = item.currentCompany;
    const year = item.graduationYear || item.passingYear;
    const batch = item.batch || item.graduationBatch;
    const deptTheme = getDeptTheme(item.department);
    const imageUrl = item.image || item.imageUrl;
    const linkedIn = item.linkedInUrl || item.linkedinUrl;

    return (
      <TouchableOpacity
        style={styles.alumniCard}
        activeOpacity={0.7}
        onPress={() => setSelectedAlumni(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Alumni: ${item.name}, ${role} ${company ? "at " + company : ""}`}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.avatarImage}
              accessible={true}
              accessibilityLabel={`${item.name}'s profile picture`}
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: BENTO.navy }]}>
              <Text style={styles.avatarInitial}>
                {(item.name || "A")[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Info Column */}
        <View style={styles.cardInfo}>
          {/* Top Row: Name + Dept Pill */}
          <View style={styles.cardTopRow}>
            <Text style={styles.alumniName} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.deptBadge,
                { backgroundColor: deptTheme.bg, borderColor: deptTheme.border },
              ]}
            >
              <Text style={[styles.deptBadgeText, { color: deptTheme.text }]}>
                {deptTheme.badge}
              </Text>
            </View>
          </View>

          {/* Role & Company */}
          <View style={styles.roleRow}>
            <Feather
              name="briefcase"
              size={12}
              color={company ? BENTO.indigo : BENTO.slate}
              style={{ marginRight: 5, marginTop: 2 }}
            />
            <Text style={styles.roleText} numberOfLines={1}>
              <Text style={{ fontWeight: "700", color: BENTO.navy }}>{role}</Text>
              {company ? ` at ${company}` : ""}
            </Text>
          </View>

          {/* Academic Batch & Graduation Year */}
          <View style={styles.academicRow}>
            <Feather
              name="award"
              size={12}
              color={BENTO.slateLight}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.academicText} numberOfLines={1}>
              {batch ? `${batch}` : "Graduate"}
              {year ? ` • Class of ${year}` : ""}
            </Text>
          </View>

          {/* Top Skills Tags (if available) */}
          {item.skills && item.skills.length > 0 && (
            <View style={styles.miniSkillsRow}>
              {item.skills.slice(0, 3).map((skill, index) => (
                <View key={index} style={styles.miniSkillPill}>
                  <Text style={styles.miniSkillText}>{skill}</Text>
                </View>
              ))}
              {item.skills.length > 3 && (
                <Text style={styles.moreSkillsText}>
                  +{item.skills.length - 3}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right Arrow / Action Indicator */}
        <View style={styles.cardRightWrap}>
          {linkedIn ? (
            <TouchableOpacity
              style={styles.cardActionIcon}
              onPress={() => openLink(linkedIn)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}'s LinkedIn profile`}
            >
              <Feather name="linkedin" size={15} color={BENTO.indigo} />
            </TouchableOpacity>
          ) : (
            <View style={styles.cardChevron}>
              <Feather name="chevron-right" size={16} color={BENTO.slateLight} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- TOP BENTO HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color={BENTO.navy} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Alumni Network</Text>
              <Text style={styles.headerSubtitle}>
                Connect with SMUCT graduates & industry leaders
              </Text>
            </View>
          </View>
        </View>

        {/* --- SEARCH BAR --- */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Feather
              name="search"
              size={18}
              color={BENTO.slate}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, company, position, or skill..."
              placeholderTextColor={BENTO.slateLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessible={true}
              accessibilityLabel="Search alumni by name, company, or skill"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearSearchBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search input"
              >
                <Feather name="x-circle" size={16} color={BENTO.slate} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filter Counts / Status Indicator */}
          {alumniList && alumniList.length > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                Showing{" "}
                <Text style={{ fontWeight: "700", color: BENTO.navy }}>
                  {filteredAlumni.length}
                </Text>{" "}
                of {alumniList.length} alumni
              </Text>
              {(searchQuery.trim().length > 0 || selectedDepartment !== null) && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedDepartment(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetFilterText}>Reset filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* --- DEPARTMENT FILTER PILLS --- */}
        {departmentOptions.length > 1 && (
          <View style={styles.departmentFilterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.departmentScrollContent}
            >
              {departmentOptions.map((item) => {
                const isActive = selectedDepartment === item.value;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.deptFilterPill,
                      isActive && styles.deptFilterPillActive,
                    ]}
                    onPress={() => setSelectedDepartment(item.value)}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityLabel={`${item.label} department alumni filter`}
                  >
                    <Text
                      style={[
                        styles.deptFilterText,
                        isActive && styles.deptFilterTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <View
                      style={[
                        styles.deptCountChip,
                        isActive && styles.deptCountChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.deptCountText,
                          isActive && styles.deptCountTextActive,
                        ]}
                      >
                        {item.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={BENTO.navy} />
            <Text style={styles.loadingText}>Loading alumni directory...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="alert-circle" size={32} color={BENTO.rose} />
            </View>
            <Text style={styles.emptyTitle}>Failed to Load Alumni</Text>
            <Text style={styles.emptySubtitle}>
              An error occurred while connecting to the alumni service. Please
              check your connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
              activeOpacity={0.8}
            >
              <Feather
                name="refresh-cw"
                size={16}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.retryButtonText}>Try Again</Text>
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
            <View style={styles.emptyIconCircle}>
              <Feather name="users" size={32} color={BENTO.navy} />
            </View>
            <Text style={styles.emptyTitle}>No Alumni Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim() || selectedDepartment
                ? "No graduates matched your current filters. Try changing your search keywords or choosing 'All'."
                : "No alumni profiles have been registered in the network yet."}
            </Text>

            {(searchQuery.trim().length > 0 || selectedDepartment !== null) && (
              <TouchableOpacity
                style={styles.clearFiltersBtn}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedDepartment(null);
                }}
                activeOpacity={0.8}
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
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredAlumni}
            keyExtractor={(item) => item.id}
            renderItem={renderAlumniCard}
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

        {/* ============================================================== */}
        {/* --- DETAILED ALUMNI PROFILE BENTO MODAL --- */}
        {/* ============================================================== */}
        <Modal
          visible={!!selectedAlumni}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedAlumni(null)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            accessibilityViewIsModal={true}
          >
            {/* Modal Header Bar */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <Text style={styles.modalHeaderTitle}>Graduate Profile</Text>
                <Text style={styles.modalHeaderSub}>SMUCT Alumni Directory</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedAlumni(null)}
                style={styles.modalCloseBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close alumni profile"
              >
                <Feather name="x" size={20} color={BENTO.navy} />
              </TouchableOpacity>
            </View>

            {selectedAlumni && (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Hero Identity Card */}
                <View style={styles.modalHeroCard}>
                  <View style={styles.modalAvatarContainer}>
                    {selectedAlumni.image || selectedAlumni.imageUrl ? (
                      <Image
                        source={{
                          uri: selectedAlumni.image || selectedAlumni.imageUrl || "",
                        }}
                        style={styles.modalAvatarImg}
                      />
                    ) : (
                      <View
                        style={[
                          styles.modalAvatarFallback,
                          { backgroundColor: BENTO.navy },
                        ]}
                      >
                        <Text style={styles.modalAvatarInitial}>
                          {(selectedAlumni.name || "A")[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.modalDeptTag,
                        {
                          backgroundColor: getDeptTheme(selectedAlumni.department)
                            .bg,
                          borderColor: getDeptTheme(selectedAlumni.department)
                            .border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalDeptTagText,
                          {
                            color: getDeptTheme(selectedAlumni.department).text,
                          },
                        ]}
                      >
                        {getDeptTheme(selectedAlumni.department).badge}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalHeroName}>{selectedAlumni.name}</Text>

                  {/* Role and Company */}
                  {(selectedAlumni.currentPosition ||
                    selectedAlumni.designation ||
                    selectedAlumni.currentRole ||
                    selectedAlumni.currentCompany) && (
                    <View style={styles.modalRoleWrap}>
                      <Feather
                        name="briefcase"
                        size={15}
                        color={BENTO.indigo}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.modalRoleText}>
                        {selectedAlumni.currentPosition ||
                          selectedAlumni.designation ||
                          selectedAlumni.currentRole ||
                          "Professional"}
                        {selectedAlumni.currentCompany
                          ? ` at ${selectedAlumni.currentCompany}`
                          : ""}
                      </Text>
                    </View>
                  )}

                  {/* Academic Summary Subtitle */}
                  <View style={styles.modalEduSubtitleRow}>
                    <Feather
                      name="award"
                      size={14}
                      color={BENTO.slate}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.modalEduSubtitleText}>
                      {selectedAlumni.batch || selectedAlumni.graduationBatch
                        ? `${selectedAlumni.batch || selectedAlumni.graduationBatch} • `
                        : ""}
                      Class of{" "}
                      {selectedAlumni.graduationYear ||
                        selectedAlumni.passingYear ||
                        "Alumni"}{" "}
                      • {selectedAlumni.department}
                    </Text>
                  </View>
                </View>

                {/* 2. Quick Action Buttons (LinkedIn, Mail, Copy) */}
                <View style={styles.quickActionRow}>
                  {(selectedAlumni.linkedInUrl || selectedAlumni.linkedinUrl) && (
                    <TouchableOpacity
                      style={[styles.quickActionBtn, styles.quickActionLinkedIn]}
                      onPress={() =>
                        openLink(
                          selectedAlumni.linkedInUrl ||
                            selectedAlumni.linkedinUrl,
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Feather
                        name="linkedin"
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.quickActionBtnText}>LinkedIn</Text>
                    </TouchableOpacity>
                  )}

                  {selectedAlumni.email && (
                    <TouchableOpacity
                      style={[styles.quickActionBtn, styles.quickActionMail]}
                      onPress={() => openLink(`mailto:${selectedAlumni.email}`)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name="mail"
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.quickActionBtnText}>Send Email</Text>
                    </TouchableOpacity>
                  )}

                  {selectedAlumni.email && (
                    <TouchableOpacity
                      style={[styles.quickActionBtn, styles.quickActionCopy]}
                      onPress={() => handleCopyEmail(selectedAlumni.email)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name="copy"
                        size={15}
                        color={BENTO.navy}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.quickActionBtnText,
                          { color: BENTO.navy },
                        ]}
                      >
                        Copy
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 3. Professional Experience Bento Card */}
                {(selectedAlumni.currentCompany ||
                  selectedAlumni.currentPosition ||
                  selectedAlumni.designation ||
                  selectedAlumni.personalWebsiteUrl) && (
                  <View style={styles.modalSectionCard}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.sectionIconWrap}>
                        <Feather
                          name="briefcase"
                          size={15}
                          color={BENTO.indigo}
                        />
                      </View>
                      <Text style={styles.sectionTitle}>
                        CAREER & INDUSTRY
                      </Text>
                    </View>

                    {selectedAlumni.currentCompany && (
                      <View style={styles.infoLine}>
                        <Text style={styles.infoLineLabel}>Company</Text>
                        <Text style={styles.infoLineValue}>
                          {selectedAlumni.currentCompany}
                        </Text>
                      </View>
                    )}

                    {(selectedAlumni.currentPosition ||
                      selectedAlumni.designation ||
                      selectedAlumni.currentRole) && (
                      <View style={styles.infoLine}>
                        <Text style={styles.infoLineLabel}>Position / Role</Text>
                        <Text style={styles.infoLineValue}>
                          {selectedAlumni.currentPosition ||
                            selectedAlumni.designation ||
                            selectedAlumni.currentRole}
                        </Text>
                      </View>
                    )}

                    {selectedAlumni.personalWebsiteUrl && (
                      <View style={styles.infoLine}>
                        <Text style={styles.infoLineLabel}>Portfolio / Site</Text>
                        <TouchableOpacity
                          onPress={() =>
                            openLink(selectedAlumni.personalWebsiteUrl)
                          }
                          activeOpacity={0.7}
                        >
                          <Text style={styles.infoLineLink}>
                            {selectedAlumni.personalWebsiteUrl}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* 4. Academic Background Bento Card */}
                <View style={styles.modalSectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIconWrap}>
                      <Feather
                        name="book-open"
                        size={15}
                        color={BENTO.emerald}
                      />
                    </View>
                    <Text style={styles.sectionTitle}>
                      ACADEMIC BACKGROUND
                    </Text>
                  </View>

                  <View style={styles.infoLine}>
                    <Text style={styles.infoLineLabel}>Degree</Text>
                    <Text style={styles.infoLineValue}>
                      {selectedAlumni.degree || "Bachelor's Degree"}
                    </Text>
                  </View>

                  <View style={styles.infoLine}>
                    <Text style={styles.infoLineLabel}>Department</Text>
                    <Text style={styles.infoLineValue}>
                      {selectedAlumni.department}
                    </Text>
                  </View>

                  {(selectedAlumni.batch || selectedAlumni.graduationBatch) && (
                    <View style={styles.infoLine}>
                      <Text style={styles.infoLineLabel}>Batch</Text>
                      <Text style={styles.infoLineValue}>
                        {selectedAlumni.batch || selectedAlumni.graduationBatch}
                      </Text>
                    </View>
                  )}

                  {(selectedAlumni.graduationYear ||
                    selectedAlumni.passingYear) && (
                    <View style={styles.infoLine}>
                      <Text style={styles.infoLineLabel}>Graduation Year</Text>
                      <Text style={styles.infoLineValue}>
                        {selectedAlumni.graduationYear ||
                          selectedAlumni.passingYear}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 5. Professional Skills Grid */}
                {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                  <View style={styles.modalSectionCard}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.sectionIconWrap}>
                        <Feather name="zap" size={15} color={BENTO.amber} />
                      </View>
                      <Text style={styles.sectionTitle}>
                        PROFESSIONAL SKILLS
                      </Text>
                    </View>

                    <View style={styles.skillsGrid}>
                      {selectedAlumni.skills.map((skill, index) => (
                        <View key={index} style={styles.skillTag}>
                          <Text style={styles.skillTagText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// --- BENTO STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO.card,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.5,
    fontFamily: BENTO.fontHeading,
  },
  headerSubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 2,
    fontFamily: BENTO.fontBody,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 1px 4px rgba(15, 23, 42, 0.04)" }
      : {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 1,
        }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BENTO.navy,
    fontFamily: BENTO.fontBody,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 12,
    color: BENTO.slate,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
  },

  // Department Filters
  departmentFilterWrapper: {
    paddingVertical: 8,
  },
  departmentScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  deptFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  deptFilterPillActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  deptFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  deptFilterTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  deptCountChip: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  deptCountChipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  deptCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
  },
  deptCountTextActive: {
    color: "#ffffff",
  },

  // Main List & Cards
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  alumniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.04)" }
      : {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 5,
          elevation: 1,
        }),
  },
  avatarWrapper: {
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: BENTO.border,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  cardInfo: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  alumniName: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
    fontFamily: BENTO.fontHeading,
    flex: 1,
    marginRight: 8,
  },
  deptBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  deptBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  roleText: {
    fontSize: 13,
    color: BENTO.slate,
    fontFamily: BENTO.fontBody,
  },
  academicRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  academicText: {
    fontSize: 12,
    color: BENTO.slateLight,
    fontWeight: "500",
  },
  miniSkillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  miniSkillPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniSkillText: {
    fontSize: 10,
    color: BENTO.slate,
    fontWeight: "600",
  },
  moreSkillsText: {
    fontSize: 10,
    color: BENTO.slateLight,
    fontWeight: "600",
    marginLeft: 2,
  },
  cardRightWrap: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BENTO.indigoBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  cardChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty & Center States
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.05)" }
      : {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        }),
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
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

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: BENTO.card,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  modalHeaderTitleWrap: {
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
  },
  modalHeaderSub: {
    fontSize: 11,
    color: BENTO.slate,
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollContent: {
    padding: 18,
    paddingBottom: 50,
  },

  // Modal Hero Card
  modalHeroCard: {
    backgroundColor: BENTO.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 14,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 10px rgba(15, 23, 42, 0.04)" }
      : {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        }),
  },
  modalAvatarContainer: {
    position: "relative",
    marginBottom: 14,
  },
  modalAvatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: BENTO.canvas,
  },
  modalAvatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: BENTO.canvas,
  },
  modalAvatarInitial: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
  },
  modalDeptTag: {
    position: "absolute",
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  modalDeptTagText: {
    fontSize: 10,
    fontWeight: "800",
  },
  modalHeroName: {
    fontSize: 20,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 6,
    fontFamily: BENTO.fontHeading,
  },
  modalRoleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalRoleText: {
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navySecondary,
    textAlign: "center",
  },
  modalEduSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  modalEduSubtitleText: {
    fontSize: 12,
    color: BENTO.slate,
    textAlign: "center",
  },

  // Quick Action Buttons
  quickActionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },
  quickActionLinkedIn: {
    backgroundColor: "#0a66c2",
  },
  quickActionMail: {
    backgroundColor: BENTO.navy,
  },
  quickActionCopy: {
    backgroundColor: BENTO.slateSubtle,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  quickActionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Section Cards in Modal
  modalSectionCard: {
    backgroundColor: BENTO.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.04)",
  },
  infoLineLabel: {
    fontSize: 13,
    color: BENTO.slate,
  },
  infoLineValue: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  infoLineLink: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.indigo,
    textDecorationLine: "underline",
    textAlign: "right",
  },

  // Skills Grid
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  skillTag: {
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
  },
});
