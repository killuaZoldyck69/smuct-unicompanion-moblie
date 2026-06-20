import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

export default function TeachersDirectoryScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // --- Fetch Data ---
  const {
    data: teachers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teachersDirectory"],
    queryFn: async () => {
      const response = await api.get("/directory/teachers");
      return response.data?.data || [];
    },
  });

  // --- Filtering & Sorting Logic ---
  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    let filtered = teachers;

    // Filter by Department
    if (selectedDepartment) {
      filtered = filtered.filter(
        (t: any) => t.teacherProfile?.department === selectedDepartment,
      );
    }

    // Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((t: any) => {
        const nameMatch = t.name?.toLowerCase().includes(lowerQuery);
        const emailMatch = t.email?.toLowerCase().includes(lowerQuery);
        const idMatch = t.teacherProfile?.teacherId
          ?.toLowerCase()
          .includes(lowerQuery);
        return nameMatch || emailMatch || idMatch;
      });
    }

    // Sort alphabetically by name
    return filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [teachers, searchQuery, selectedDepartment]);

  // Extract unique departments for the filter bar
  const uniqueDepartments = useMemo(() => {
    if (!teachers) return [];
    const depts = new Set<string>();
    teachers.forEach((t: any) => {
      if (t.teacherProfile?.department) depts.add(t.teacherProfile.department);
    });
    return Array.from(depts).sort();
  }, [teachers]);

  // --- Reusable Info Row Component for Modal ---
  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string | null;
  }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoRowLeft}>
          <Feather
            name={icon}
            size={16}
            color={colors.outline}
            style={styles.infoIcon}
          />
          <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    );
  };

  // --- UI Renderers ---
  const renderTeacherCard = ({ item }: { item: any }) => {
    const profile = item.teacherProfile;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setSelectedTeacher(item)}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.userSubtitle} numberOfLines={1}>
            {profile?.designation || "Faculty Member"}
          </Text>
          <Text style={styles.userInfo}>
            {profile?.department || "No Department"}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.outline} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Faculty Directory</Text>
          <Text style={styles.headerSubtitle}>
            Find and contact your teachers
          </Text>
        </View>
      </View>

      <View style={styles.searchContainerWrapper}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or email..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x-circle" size={18} color={colors.outline} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {uniqueDepartments.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={uniqueDepartments}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  selectedDepartment === item && styles.filterPillActive,
                ]}
                onPress={() =>
                  setSelectedDepartment(
                    selectedDepartment === item ? null : item,
                  )
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedDepartment === item && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : isError || filteredTeachers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="users"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Teachers Found</Text>
          <Text style={styles.emptyDesc}>
            Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTeachers}
          keyExtractor={(item) => item.id}
          renderItem={renderTeacherCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* DETAILED TEACHER PROFILE MODAL */}
      <Modal
        visible={!!selectedTeacher}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Teacher Profile</Text>
            <TouchableOpacity
              onPress={() => setSelectedTeacher(null)}
              style={styles.closeBtn}
            >
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {selectedTeacher && (
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalProfileHeader}>
                {selectedTeacher.image ? (
                  <Image
                    source={{ uri: selectedTeacher.image }}
                    style={styles.modalAvatarImage}
                  />
                ) : (
                  <View style={styles.modalAvatarFallback}>
                    <Text style={styles.modalAvatarTextLarge}>
                      {selectedTeacher.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <Text style={styles.modalName}>{selectedTeacher.name}</Text>
                <Text style={styles.modalDesignation}>
                  {selectedTeacher.teacherProfile?.designation}
                </Text>
                <Text style={styles.modalDepartment}>
                  {selectedTeacher.teacherProfile?.department}
                </Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <InfoRow
                  icon="mail"
                  label="Email"
                  value={selectedTeacher.email}
                />
                <InfoRow
                  icon="phone"
                  label="Phone"
                  value={selectedTeacher.phoneNumber}
                />
                <InfoRow
                  icon="linkedin"
                  label="LinkedIn"
                  value={selectedTeacher.teacherProfile?.linkedInUrl}
                />
                <InfoRow
                  icon="globe"
                  label="Website"
                  value={selectedTeacher.teacherProfile?.personalWebsiteUrl}
                />
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Academic Details</Text>
                <InfoRow
                  icon="hash"
                  label="Teacher ID"
                  value={selectedTeacher.teacherProfile?.teacherId}
                />
                <InfoRow
                  icon="book"
                  label="Faculty"
                  value={selectedTeacher.teacherProfile?.faculty}
                />
                <InfoRow
                  icon="map-pin"
                  label="Office Room"
                  value={selectedTeacher.teacherProfile?.officeRoom}
                />
                <InfoRow
                  icon="clock"
                  label="Consultation"
                  value={selectedTeacher.teacherProfile?.consultationHours}
                />
              </View>

              {selectedTeacher.teacherProfile?.expertiseFields?.length > 0 && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Expertise Fields</Text>
                  <View style={styles.tagsContainer}>
                    {selectedTeacher.teacherProfile.expertiseFields.map(
                      (tag: string, i: number) => (
                        <View key={i} style={styles.tagChip}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  searchContainerWrapper: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.stackMd,
    height: 48,
  },
  searchIcon: { marginRight: spacing.stackSm },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },

  filterContainer: {
    paddingVertical: spacing.stackMd,
    paddingLeft: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerHigh,
    marginRight: spacing.stackSm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary,
  },
  filterText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  filterTextActive: { color: colors.secondary, fontWeight: "700" },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  emptyTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  emptyDesc: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
  },

  listContent: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.stackMd,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarText: {
    ...typography.titleLg,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  cardContent: { flex: 1 },
  userName: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 2,
  },
  userSubtitle: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  userInfo: { ...typography.labelSm, color: colors.outline },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  modalHeaderTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  closeBtn: {
    padding: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
  },
  modalScrollContent: { padding: spacing.marginMobile, paddingBottom: 60 },

  modalProfileHeader: {
    alignItems: "center",
    marginBottom: spacing.sectionBreak,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.xl,
    ...shadows.level1,
  },
  modalAvatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  modalAvatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: spacing.stackLg,
    borderWidth: 3,
    borderColor: colors.surfaceContainerLowest,
  },
  modalAvatarTextLarge: {
    fontSize: 36,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  modalName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: "700",
    textAlign: "center",
  },
  modalDesignation: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  modalDepartment: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: 2,
  },

  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackLg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  sectionTitle: {
    ...typography.labelMd,
    fontSize: 13,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.stackLg,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginRight: spacing.stackMd,
  },
  infoIcon: { marginRight: 10 },
  infoLabel: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  infoValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    backgroundColor: colors.primaryContainer + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.primaryContainer + "30",
  },
  tagText: {
    ...typography.labelSm,
    color: colors.primaryContainer,
    fontWeight: "600",
  },
});
