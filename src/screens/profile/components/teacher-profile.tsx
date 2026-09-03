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

import { useTeacherProfile } from "@/features/profile/useTeacherProfile";
import {
  PROFILE_COLORS,
  BLOOD_GROUP_TO_UI,
  BLOOD_GROUP_TO_DB,
  fontFamily,
} from "../constants";
import { BloodGroupModal } from "./shared/blood-group-modal";
import { ProfileSocialCard } from "./shared/profile-social-card";
import { ProfileLogoutButton } from "./shared/profile-logout-button";
import { ProfileErrorState } from "./shared/profile-states";

interface TeacherProfileProps {
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export default function TeacherProfile({ sessionUser }: TeacherProfileProps) {
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  const [expertiseInput, setExpertiseInput] = useState("");
  const [qualDegreeInput, setQualDegreeInput] = useState("");
  const [qualInstInput, setQualInstInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    bloodGroup: "",
    designation: "",
    department: "",
    faculty: "",
    officeRoom: "",
    consultationHours: "",
    expertiseFields: [] as string[],
    academicQualifications: {} as Record<string, string>,
    linkedInUrl: "",
    personalWebsiteUrl: "",
  });

  const {
    profile,
    isLoading,
    isError,
    refetch,
    updateProfile: updateTeacherProfile,
    isUpdating,
    pickAndUploadAvatar,
    isUploading,
  } = useTeacherProfile();

  const populateFormData = useCallback(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] || "" : "",
        designation: profile.designation || "",
        department: profile.department || "",
        faculty: profile.faculty || "",
        officeRoom: profile.roomNumber || (profile as any).officeRoom || "",
        consultationHours: (profile as any).consultationHours || profile.officeHours || "",
        expertiseFields: (profile as any).expertiseFields || profile.researchInterests || [],
        academicQualifications:
          typeof (profile as any).academicQualifications === "object" && (profile as any).academicQualifications !== null
            ? ((profile as any).academicQualifications as Record<string, string>)
            : {},
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
    if (formData.designation !== profile?.designation) payload.designation = formData.designation;
    if (formData.department !== profile?.department) payload.department = formData.department;
    if (formData.faculty !== profile?.faculty) payload.faculty = formData.faculty;
    if (formData.officeRoom !== (profile?.roomNumber || (profile as any)?.officeRoom)) {
      payload.officeRoom = formData.officeRoom;
    }
    if (formData.consultationHours !== ((profile as any)?.consultationHours || profile?.officeHours)) {
      payload.consultationHours = formData.consultationHours;
    }

    const mappedBloodGroup = formData.bloodGroup ? BLOOD_GROUP_TO_DB[formData.bloodGroup] : undefined;
    if (mappedBloodGroup !== profile?.bloodGroup && mappedBloodGroup !== undefined) {
      payload.bloodGroup = mappedBloodGroup;
    }

    if (JSON.stringify(formData.expertiseFields) !== JSON.stringify((profile as any)?.expertiseFields || profile?.researchInterests || [])) {
      payload.expertiseFields = formData.expertiseFields;
    }
    if (
      JSON.stringify(formData.academicQualifications) !==
      JSON.stringify((profile as any)?.academicQualifications || {})
    ) {
      payload.academicQualifications = formData.academicQualifications;
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

    updateTeacherProfile(payload, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const addExpertise = () => {
    const trimmed = expertiseInput.trim();
    if (!trimmed || formData.expertiseFields.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      expertiseFields: [...prev.expertiseFields, trimmed],
    }));
    setExpertiseInput("");
  };

  const removeExpertise = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      expertiseFields: prev.expertiseFields.filter((f) => f !== field),
    }));
  };

  const addQualification = () => {
    const degree = qualDegreeInput.trim();
    const inst = qualInstInput.trim();
    if (!degree || !inst) return;
    setFormData((prev) => ({
      ...prev,
      academicQualifications: {
        ...prev.academicQualifications,
        [degree]: inst,
      },
    }));
    setQualDegreeInput("");
    setQualInstInput("");
  };

  const removeQualification = (degree: string) => {
    const nextQuals = { ...formData.academicQualifications };
    delete nextQuals[degree];
    setFormData((prev) => ({
      ...prev,
      academicQualifications: nextQuals,
    }));
  };

  const handleUpdatePicture = async () => {
    const safeName = profile?.name?.replace(/\s+/g, "").toLowerCase() || "faculty";
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
        title={!profile ? "No faculty profile found" : "Failed to load faculty profile"}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={[styles.topActions, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.screenTitle}>Faculty Profile</Text>

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
        {/* Avatar & Basic Info */}
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
              <View style={styles.roleBadge}>
                <Feather name="award" size={12} color="#047857" />
                <Text style={styles.roleBadgeText}>Faculty</Text>
              </View>
              <Text style={styles.subText}>{profile.designation || "Lecturer"}</Text>
              <Text style={styles.subText}>{profile.email || sessionUser.email}</Text>
            </View>
          </View>
        </View>

        {/* Faculty & Academic Details */}
        <View style={[styles.card, styles.yellowCard]}>
          <Text style={styles.yellowSectionTitle}>ACADEMIC POSITION</Text>

          <View style={styles.yellowInfoRow}>
            <View style={styles.yellowIconCircle}>
              <Feather name="briefcase" size={16} color="#854d0e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowLabel}>Designation</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInputLeft}
                  value={formData.designation}
                  onChangeText={(text) => setFormData({ ...formData, designation: text })}
                  placeholder="e.g. Senior Lecturer"
                  accessible={true}
                  accessibilityLabel="Designation"
                />
              ) : (
                <Text style={styles.yellowValue}>{profile.designation || "Not provided"}</Text>
              )}
            </View>
          </View>

          <View style={styles.yellowInfoRow}>
            <View style={styles.yellowIconCircle}>
              <Feather name="book" size={16} color="#854d0e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowLabel}>Department</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInputLeft}
                  value={formData.department}
                  onChangeText={(text) => setFormData({ ...formData, department: text })}
                  placeholder="e.g. Computer Science"
                  accessible={true}
                  accessibilityLabel="Department"
                />
              ) : (
                <Text style={styles.yellowValue}>{profile.department || "Not provided"}</Text>
              )}
            </View>
          </View>

          <View style={styles.yellowInfoRow}>
            <View style={styles.yellowIconCircle}>
              <Feather name="map-pin" size={16} color="#854d0e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowLabel}>Office Room</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInputLeft}
                  value={formData.officeRoom}
                  onChangeText={(text) => setFormData({ ...formData, officeRoom: text })}
                  placeholder="e.g. Room 402, Building A"
                  accessible={true}
                  accessibilityLabel="Office Room"
                />
              ) : (
                <Text style={styles.yellowValue}>
                  {profile.roomNumber
                    ? `Office: ${profile.roomNumber}`
                    : (profile as any).officeRoom
                      ? `Office: ${(profile as any).officeRoom}`
                      : "Not provided"}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.yellowInfoRow, { marginBottom: 0 }]}>
            <View style={styles.yellowIconCircle}>
              <Feather name="clock" size={16} color="#854d0e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowLabel}>Consultation Hours</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInputLeft}
                  value={formData.consultationHours}
                  onChangeText={(text) => setFormData({ ...formData, consultationHours: text })}
                  placeholder="e.g. Sun-Tue 11:00 AM - 1:00 PM"
                  accessible={true}
                  accessibilityLabel="Consultation Hours"
                />
              ) : (
                <Text style={styles.yellowValue}>
                  {(profile as any).consultationHours || profile.officeHours || "Not provided"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Expertise & Qualifications */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="star" size={18} color={PROFILE_COLORS.deepNavy} />
            <Text style={styles.sectionTitle}>Professional Expertise</Text>
          </View>

          {isEditing && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={expertiseInput}
                onChangeText={setExpertiseInput}
                placeholder="Add expertise field..."
                placeholderTextColor={PROFILE_COLORS.subtleText}
                accessible={true}
                accessibilityLabel="Add expertise input"
              />
              <TouchableOpacity
                onPress={addExpertise}
                style={styles.addBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add expertise"
              >
                <Feather name="plus" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.chipContainer}>
            {formData.expertiseFields.length > 0 ? (
              formData.expertiseFields.map((field, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{field}</Text>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => removeExpertise(field)}
                      style={{ marginLeft: 6 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${field}`}
                    >
                      <Feather name="x" size={14} color={PROFILE_COLORS.deepNavy} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No expertise added yet.</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeaderRow}>
            <Feather name="award" size={18} color={PROFILE_COLORS.deepNavy} />
            <Text style={styles.sectionTitle}>Qualifications</Text>
          </View>

          {isEditing && (
            <View style={styles.qualInputBox}>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                value={qualDegreeInput}
                onChangeText={setQualDegreeInput}
                placeholder="Degree (e.g. M.Sc in CS)"
                placeholderTextColor={PROFILE_COLORS.subtleText}
                accessible={true}
                accessibilityLabel="Degree input"
              />
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={qualInstInput}
                  onChangeText={setQualInstInput}
                  placeholder="Institution Name"
                  placeholderTextColor={PROFILE_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Institution input"
                />
                <TouchableOpacity
                  onPress={addQualification}
                  style={styles.addBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add qualification"
                >
                  <Feather name="plus" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ marginTop: 8 }}>
            {Object.entries(formData.academicQualifications).length > 0 ? (
              Object.entries(formData.academicQualifications).map(([degree, inst], idx) => (
                <View key={idx} style={styles.qualRow}>
                  <View style={styles.bullet} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.qualDegree}>{degree}</Text>
                    <Text style={styles.qualInst}>{inst}</Text>
                  </View>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => removeQualification(degree)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove qualification ${degree}`}
                    >
                      <Feather name="trash-2" size={16} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No qualifications added yet.</Text>
            )}
          </View>
        </View>

        {/* Contact Row (Phone & Blood Group) */}
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
  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: PROFILE_COLORS.pillRadius,
    gap: 4,
    marginBottom: 6,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  subText: {
    fontFamily,
    fontSize: 12,
    color: PROFILE_COLORS.subtleText,
    lineHeight: 16,
  },
  yellowCard: {
    backgroundColor: "#fefce8",
    borderColor: "#fde68a",
  },
  yellowSectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#854d0e",
    letterSpacing: 1,
    marginBottom: 14,
  },
  yellowInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  yellowIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(253, 230, 138, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  yellowLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#854d0e",
    marginBottom: 2,
  },
  yellowValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_COLORS.neutralText,
  },
  editInputLeft: {
    fontFamily,
    fontSize: 14,
    color: PROFILE_COLORS.neutralText,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: PROFILE_COLORS.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.neutralText,
    padding: 0,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PROFILE_COLORS.deepNavy,
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
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: PROFILE_COLORS.pillRadius,
  },
  chipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginVertical: 16,
  },
  qualInputBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qualRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PROFILE_COLORS.deepNavy,
    marginRight: 10,
  },
  qualDegree: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.neutralText,
  },
  qualInst: {
    fontFamily,
    fontSize: 11,
    color: PROFILE_COLORS.subtleText,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  bentoItem: {
    flex: 1,
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
  bentoInput: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 2,
    minWidth: 80,
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
