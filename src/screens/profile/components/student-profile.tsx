import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useStudentProfile } from "@/features/profile/useStudentProfile";
import {
  PROFILE_COLORS,
  BLOOD_GROUP_TO_UI,
  BLOOD_GROUP_TO_DB,
  fontFamily,
} from "../constants";
import { getOrdinalSuffix } from "../utils";
import { BloodGroupModal } from "./shared/blood-group-modal";
import { ProfileSocialCard } from "./shared/profile-social-card";
import { ProfileLogoutButton } from "./shared/profile-logout-button";
import { ProfileErrorState } from "./shared/profile-states";

interface StudentProfileProps {
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export default function StudentProfile({ sessionUser }: StudentProfileProps) {
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    bloodGroup: "",
    currentSemester: "",
    section: "",
    skills: [] as string[],
    linkedInUrl: "",
    personalWebsiteUrl: "",
  });

  const {
    profile,
    isLoading,
    isError,
    refetch,
    updateProfile: updateStudentProfile,
    isUpdating,
    pickAndUploadAvatar,
    isUploading,
  } = useStudentProfile();

  const populateFormData = useCallback(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] || "" : "",
        currentSemester: profile.currentSemester ? String(profile.currentSemester) : "",
        section: profile.section || "",
        skills: profile.skills || [],
        linkedInUrl: profile.linkedInUrl || "",
        personalWebsiteUrl: profile.personalWebsiteUrl || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    populateFormData();
  }, [populateFormData, isEditing]);

  const handleCancel = () => {
    populateFormData();
    setIsEditing(false);
  };

  const handleSave = () => {
    const payload: Record<string, any> = {};

    if (formData.name !== profile?.name) payload.name = formData.name;
    if (formData.phoneNumber !== profile?.phoneNumber) payload.phoneNumber = formData.phoneNumber;
    if (formData.section !== profile?.section) payload.section = formData.section;

    const parsedSemester = parseInt(formData.currentSemester.replace(/\D/g, "") || "1", 10);
    if (parsedSemester !== profile?.currentSemester) payload.currentSemester = parsedSemester;

    const mappedBloodGroup = formData.bloodGroup ? BLOOD_GROUP_TO_DB[formData.bloodGroup] : undefined;
    if (mappedBloodGroup !== profile?.bloodGroup && mappedBloodGroup !== undefined) {
      payload.bloodGroup = mappedBloodGroup;
    }

    if (JSON.stringify(formData.skills) !== JSON.stringify(profile?.skills || [])) {
      payload.skills = formData.skills;
    }
    if (formData.linkedInUrl !== (profile?.linkedInUrl || "")) {
      payload.linkedInUrl = formData.linkedInUrl;
    }
    if (formData.personalWebsiteUrl !== (profile?.personalWebsiteUrl || "")) {
      payload.personalWebsiteUrl = formData.personalWebsiteUrl;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    updateStudentProfile(payload, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || formData.skills.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleUpdatePicture = async () => {
    const safeName = profile?.name?.replace(/\s+/g, "").toLowerCase() || "student";
    await pickAndUploadAvatar(safeName);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PROFILE_COLORS.deepNavy} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <ProfileErrorState
        title={!profile ? "No student profile found" : "Failed to load student profile"}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={[styles.topActions, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.screenTitle}>My Profile</Text>

        <View style={styles.actionButtonsRow}>
          {isEditing && (
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.topBtn, styles.cancelBtn]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Feather name="x" size={16} color="#dc2626" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            style={styles.topBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? "Save changes" : "Edit profile"}
          >
            <Feather
              name={isEditing ? "check" : "edit-2"}
              size={16}
              color={PROFILE_COLORS.deepNavy}
            />
            <Text style={styles.topBtnText}>
              {isUpdating ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 104 : 116 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Identity Hero */}
        <View style={[styles.card, styles.heroCard]}>
          <View style={styles.avatarRow}>
            <TouchableOpacity
              onPress={handleUpdatePicture}
              disabled={isUploading}
              style={styles.avatarContainer}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
            >
              {profile.image ? (
                <Image
                  source={{ uri: profile.image }}
                  style={styles.avatar}
                  accessible={true}
                  accessibilityLabel={`${profile.name}'s profile picture`}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather name="user" size={32} color={PROFILE_COLORS.subtleText} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Feather name="camera" size={12} color="#ffffff" />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.avatarTextContainer}>
              <Text style={styles.nameText}>{profile.name || sessionUser.name}</Text>
              <View style={styles.roleRow}>
                <View style={styles.rolePill}>
                  <Feather name="book-open" size={12} color={PROFILE_COLORS.deepNavy} />
                  <Text style={styles.rolePillText}>Student</Text>
                </View>
                {profile.isCR && (
                  <View style={[styles.rolePill, { backgroundColor: "#e0e7ff" }]}>
                    <Text style={[styles.rolePillText, { color: "#3730a3" }]}>CR</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subText}>ID: {profile.studentId}</Text>
              <Text style={styles.subText}>{profile.email || sessionUser.email}</Text>
            </View>
          </View>
        </View>

        {/* Academics Card */}
        <View style={[styles.card, styles.pinkCard]}>
          <View style={styles.iconRow}>
            <Feather name="layers" size={16} color="#9d174d" />
            <Text style={styles.pinkLabel}>FACULTY</Text>
          </View>
          <Text style={styles.pinkValue}>{profile.faculty || "Faculty of Creative Technology"}</Text>

          <View style={styles.dividerPink} />

          <View style={styles.iconRow}>
            <Feather name="book" size={16} color="#9d174d" />
            <Text style={styles.pinkLabel}>DEPARTMENT</Text>
          </View>
          <Text style={styles.pinkValue}>{profile.department || "N/A"}</Text>

          <View style={styles.dividerPink} />

          <View style={styles.iconRow}>
            <Feather name="award" size={16} color="#9d174d" />
            <Text style={styles.pinkLabel}>PROGRAM</Text>
          </View>
          <Text style={styles.pinkValue}>{profile.program || "N/A"}</Text>
        </View>

        {/* Semester / Batch / Section Grid */}
        <View style={styles.bentoRow}>
          <View style={[styles.card, styles.bentoItem, styles.yellowCard]}>
            <Text style={styles.bentoSmallTitle}>SEMESTER</Text>
            {isEditing ? (
              <TextInput
                style={styles.bentoInput}
                value={formData.currentSemester}
                onChangeText={(text) => setFormData({ ...formData, currentSemester: text })}
                keyboardType="numeric"
                accessible={true}
                accessibilityLabel="Current Semester"
              />
            ) : (
              <Text style={styles.bentoValue}>
                {getOrdinalSuffix(profile.currentSemester || "1")}
              </Text>
            )}
          </View>

          <View style={styles.bentoCol}>
            <View style={[styles.card, styles.bentoItemSmall, styles.yellowCard]}>
              <Text style={styles.bentoSmallTitle}>BATCH</Text>
              <Text style={styles.bentoValueSmall}>
                {getOrdinalSuffix(profile.batch || "26")}
              </Text>
            </View>

            <View style={[styles.card, styles.bentoItemSmall, styles.blueCard]}>
              <Text style={styles.bentoSmallTitle}>SECTION</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bentoInput}
                  value={formData.section}
                  onChangeText={(text) => setFormData({ ...formData, section: text })}
                  accessible={true}
                  accessibilityLabel="Section"
                />
              ) : (
                <Text style={styles.bentoValueSmall}>{profile.section || "A"}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Skills Card */}
        <View style={[styles.card, styles.skillsCard]}>
          <Text style={styles.skillsTitle}>PROFESSIONAL SKILLS</Text>

          {isEditing && (
            <View style={styles.skillInputWrapper}>
              <TextInput
                style={styles.skillInput}
                value={skillInput}
                onChangeText={setSkillInput}
                placeholder="Add a skill..."
                placeholderTextColor={PROFILE_COLORS.subtleText}
                accessible={true}
                accessibilityLabel="Add skill input"
              />
              <TouchableOpacity
                onPress={addSkill}
                style={styles.addSkillBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add skill to list"
              >
                <Feather name="plus" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.chipContainer}>
            {formData.skills.length > 0 ? (
              formData.skills.map((skill, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{skill}</Text>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => removeSkill(skill)}
                      style={{ marginLeft: 6 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${skill}`}
                    >
                      <Feather name="x" size={14} color="#065f46" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptySkillsText}>No skills added yet.</Text>
            )}
          </View>
        </View>

        {/* Blood Group & Phone */}
        <View style={styles.bentoRow}>
          <View style={[styles.card, styles.bentoItem]}>
            <View style={styles.centerContent}>
              <View style={[styles.iconCircle, { backgroundColor: "#fee2e2" }]}>
                <Feather name="droplet" size={18} color="#dc2626" />
              </View>
              <Text style={styles.bentoSmallTitle}>BLOOD GROUP</Text>
              {isEditing ? (
                <TouchableOpacity
                  onPress={() => setBloodGroupModalVisible(true)}
                  style={styles.editPillBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select blood group"
                >
                  <Text style={styles.editPillText}>{formData.bloodGroup || "Select"}</Text>
                  <Feather name="chevron-down" size={14} color="#dc2626" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ) : (
                <Text style={[styles.bentoValue, { color: "#dc2626", fontSize: 20 }]}>
                  {profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] || "N/A" : "N/A"}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.card, styles.bentoItem]}>
            <View style={styles.centerContent}>
              <View style={[styles.iconCircle, { backgroundColor: "#e0e7ff" }]}>
                <Feather name="phone" size={18} color="#4f46e5" />
              </View>
              <Text style={styles.bentoSmallTitle}>PHONE</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bentoInput}
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  keyboardType="phone-pad"
                  placeholder="Add Phone"
                  placeholderTextColor={PROFILE_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Phone Number input"
                />
              ) : (
                <Text style={[styles.bentoValue, { fontSize: 15 }]}>
                  {profile.phoneNumber || "Not provided"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Portfolio & Social Profiles */}
        <ProfileSocialCard
          isEditing={isEditing}
          linkedInUrl={formData.linkedInUrl}
          personalWebsiteUrl={formData.personalWebsiteUrl}
          onChangeLinkedIn={(url) => setFormData((prev) => ({ ...prev, linkedInUrl: url }))}
          onChangeWebsite={(url) => setFormData((prev) => ({ ...prev, personalWebsiteUrl: url }))}
        />

        {/* Logout */}
        <ProfileLogoutButton />
      </ScrollView>

      {/* Blood Group Modal */}
      <BloodGroupModal
        visible={isBloodGroupModalVisible}
        selectedGroup={formData.bloodGroup}
        onSelect={(group) => setFormData((prev) => ({ ...prev, bloodGroup: group }))}
        onClose={() => setBloodGroupModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.background,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  screenTitle: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  topBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  cancelBtn: {
    marginRight: 8,
    borderColor: "rgba(220, 38, 38, 0.2)",
    backgroundColor: "#fef2f2",
  },
  cancelText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
    marginLeft: 4,
  },
  topBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  heroCard: {
    padding: 18,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PROFILE_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: PROFILE_COLORS.white,
  },
  avatarTextContainer: {
    flex: 1,
  },
  nameText: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: PROFILE_COLORS.neutralText,
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: PROFILE_COLORS.pillRadius,
    gap: 4,
  },
  rolePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  subText: {
    fontFamily,
    fontSize: 12,
    color: PROFILE_COLORS.subtleText,
    lineHeight: 16,
  },
  pinkCard: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  pinkLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#9d174d",
    letterSpacing: 1,
  },
  pinkValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_COLORS.neutralText,
  },
  dividerPink: {
    height: 1,
    backgroundColor: "rgba(157, 23, 77, 0.1)",
    marginVertical: 10,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  bentoCol: {
    flex: 1,
    gap: 12,
  },
  bentoItem: {
    flex: 1,
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  bentoItemSmall: {
    flex: 1,
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  yellowCard: {
    backgroundColor: "#fefce8",
    borderColor: "#fde68a",
  },
  blueCard: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  bentoSmallTitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  bentoValue: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
  },
  bentoValueSmall: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
  },
  bentoInput: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 2,
    minWidth: 60,
  },
  skillsCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  skillsTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#065f46",
    letterSpacing: 1,
    marginBottom: 12,
  },
  skillInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  skillInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.neutralText,
    padding: 0,
  },
  addSkillBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  chipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#065f46",
  },
  emptySkillsText: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.subtleText,
  },
  centerContent: {
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  editPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: PROFILE_COLORS.pillRadius,
  },
  editPillText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },
});
