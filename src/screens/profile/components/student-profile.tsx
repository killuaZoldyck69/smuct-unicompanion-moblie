import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  FlatList,
  Linking,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/services/supabase";

import Toast from "react-native-toast-message";
import { authClient } from "@/services/auth-client";
import { colors } from "@/theme/colors";
import { shadows } from "@/theme/layout";
import { useStudentProfile } from "@/features/profile/useStudentProfile";

// 3. Blood Group Data & Mappers
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BLOOD_GROUP_TO_DB: Record<string, string> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

const BLOOD_GROUP_TO_UI: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

const getOrdinalSuffix = (num: number | string) => {
  const n = typeof num === "string" ? parseInt(num) : num;
  if (isNaN(n)) return num;
  const s = ["ᵗʰ", "ˢᵗ", "ⁿᵈ", "ʳᵈ"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function StudentProfile({ sessionUser }: { sessionUser: any }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  // Complex Input State
  const [skillInput, setSkillInput] = useState("");

  // Editable Form State
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

  // Fetch and Update using useStudentProfile hook
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

  // Hydrate form data
  const populateFormData = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup
          ? BLOOD_GROUP_TO_UI[profile.bloodGroup]
          : "",
        currentSemester: profile.currentSemester
          ? String(profile.currentSemester)
          : "",
        section: profile.section || "",
        skills: profile.skills || [],
        linkedInUrl: profile.linkedInUrl || "",
        personalWebsiteUrl: profile.personalWebsiteUrl || "",
      });
    }
  };

  useEffect(() => {
    populateFormData();
  }, [profile, isEditing]);

  const handleCancel = () => {
    populateFormData(); // Revert to original
    setIsEditing(false); // Close edit mode
  };

  const handleSave = () => {
    const payload: any = {};

    if (formData.name !== profile?.name) payload.name = formData.name;
    if (formData.phoneNumber !== profile?.phoneNumber)
      payload.phoneNumber = formData.phoneNumber;
    if (formData.section !== profile?.section)
      payload.section = formData.section;

    const parsedSemester = parseInt(
      formData.currentSemester.replace(/\D/g, "") || "1",
    );
    if (parsedSemester !== profile?.currentSemester)
      payload.currentSemester = parsedSemester;

    const mappedBloodGroup = formData.bloodGroup
      ? BLOOD_GROUP_TO_DB[formData.bloodGroup]
      : undefined;
    if (
      mappedBloodGroup !== profile?.bloodGroup &&
      mappedBloodGroup !== undefined
    ) {
      payload.bloodGroup = mappedBloodGroup;
    }

    if (
      JSON.stringify(formData.skills) !== JSON.stringify(profile?.skills || [])
    ) {
      payload.skills = formData.skills;
    }
    if (formData.linkedInUrl !== (profile?.linkedInUrl || ""))
      payload.linkedInUrl = formData.linkedInUrl;
    if (formData.personalWebsiteUrl !== (profile?.personalWebsiteUrl || ""))
      payload.personalWebsiteUrl = formData.personalWebsiteUrl;

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
    if (!skillInput.trim() || formData.skills.includes(skillInput.trim()))
      return;
    setFormData({
      ...formData,
      skills: [...formData.skills, skillInput.trim()],
    });
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const openLink = async (url?: string | null) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Toast.show({ type: "error", text1: "Cannot open URL" });
  };

  const handleUpdatePicture = async () => {
    const safeName = profile?.name?.replace(/\s+/g, "").toLowerCase() || "user";
    await pickAndUploadAvatar(safeName);
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await authClient.signOut();
        if (Platform.OS !== "web") {
          await SecureStore.deleteItemAsync("better-auth.session_token");
          await SecureStore.deleteItemAsync("better-auth_cookie");
          await SecureStore.deleteItemAsync("better-auth_session_data");
        }
        queryClient.setQueryData(["currentUser"], null);
        queryClient.clear();
        Toast.show({ type: "success", text1: "Logged out successfully" });
        router.replace("/(auth)/login");
      } catch (error) {
        Toast.show({ type: "error", text1: "Failed to log out cleanly." });
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) performLogout();
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: performLogout },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#131b2e" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <Feather
          name="alert-circle"
          size={48}
          color="#ef4444"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.errorText}>Failed to load student profile</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <Feather
            name="refresh-cw"
            size={16}
            color="#ffffff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.logoutButton, { marginTop: 12 }]} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <Text style={styles.errorText}>No student profile found.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderInputRow = (
    label: string,
    key: keyof typeof formData,
    icon: any,
    options?: any,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather
          name={icon}
          size={18}
          color={colors.outline}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={formData[key] as string}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholderTextColor={colors.outlineVariant}
          {...options}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Top Header Row for Edit Action */}
      <View style={[styles.topActions, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.screenTitle}>My Profile</Text>

        <View style={styles.actionButtonsRow}>
          {isEditing && (
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                styles.topEditBtn,
                { marginRight: 8, borderColor: "#DC2626" },
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing profile"
            >
              <Feather name="x" size={16} color="#DC2626" />
              <Text style={[styles.topEditText, { color: "#DC2626" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            style={styles.topEditBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? "Save profile changes" : "Edit profile"}
          >
            <Feather
              name={isEditing ? "check" : "edit-2"}
              size={16}
              color={colors.onSurface}
            />
            <Text style={styles.topEditText}>
              {isUpdating
                ? "Saving"
                : isEditing
                  ? "Save"
                  : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR & BASIC INFO CARD */}
        <View style={[styles.bentoCard, styles.avatarCard]}>
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
                  accessibilityLabel={`${profile.name}'s avatar`}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather
                    name="user"
                    size={32}
                    color={colors.onSurfaceVariant}
                  />
                </View>
              )}
              <View style={styles.cameraBadge}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="camera" size={12} color="#fff" />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.avatarTextContainer}>
              <Text style={styles.nameText}>{profile.name}</Text>
              <View style={styles.roleRow}>
                <View style={styles.rolePill}>
                  <Feather
                    name="book-open"
                    size={12}
                    color={colors.primaryContainer}
                  />
                  <Text style={styles.rolePillText}>Student</Text>
                </View>
                {profile.isCR && (
                  <View
                    style={[styles.rolePill, { backgroundColor: "#E0E7FF" }]}
                  >
                    <Text style={[styles.rolePillText, { color: "#3730A3" }]}>
                      CR
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.subText}>ID: {profile.studentId}</Text>
              <Text style={styles.subText}>{profile.email}</Text>
            </View>
          </View>
        </View>

        {/* ACADEMICS CARD (Pink Tint) */}
        <View style={[styles.bentoCard, styles.academicsCard]}>
          <View style={styles.iconRow}>
            <Feather name="layers" size={18} color="#9D174D" />
            <Text style={styles.academicsTitle}>FACULTY</Text>
          </View>
          <Text style={styles.academicsValue}>{profile.faculty}</Text>

          <View style={styles.dividerPink} />

          <View style={styles.iconRow}>
            <Feather name="book" size={18} color="#9D174D" />
            <Text style={styles.academicsTitle}>DEPARTMENT</Text>
          </View>
          <Text style={styles.academicsValue}>{profile.department}</Text>

          <View style={styles.dividerPink} />

          <View style={styles.iconRow}>
            <Feather name="award" size={18} color="#9D174D" />
            <Text style={styles.academicsTitle}>PROGRAM</Text>
          </View>
          <Text style={styles.academicsValue}>{profile.program}</Text>
        </View>

        {/* BENTO GRID ROW: SEMESTER, BATCH, SECTION */}
        <View style={styles.bentoRow}>
          <View style={[styles.bentoCard, styles.bentoItem, styles.yellowCard]}>
            <Text style={styles.bentoSmallTitleCenter}>SEMESTER</Text>
            {isEditing ? (
              <TextInput
                style={styles.bentoEditInput}
                value={formData.currentSemester}
                onChangeText={(text) =>
                  setFormData({ ...formData, currentSemester: text })
                }
                keyboardType="numeric"
                accessible={true}
                accessibilityLabel="Current Semester"
              />
            ) : (
              <Text style={styles.bentoLargeValue}>
                {getOrdinalSuffix(profile.currentSemester || "1")}
              </Text>
            )}
          </View>

          <View style={styles.bentoCol}>
            <View
              style={[
                styles.bentoCard,
                styles.bentoItemSmall,
                styles.yellowCard,
              ]}
            >
              <Text style={styles.bentoSmallTitleCenter}>BATCH</Text>
              <Text style={styles.bentoMediumValue}>
                {getOrdinalSuffix(profile.batch || "26")}
              </Text>
            </View>

            <View
              style={[styles.bentoCard, styles.bentoItemSmall, styles.blueCard]}
            >
              <Text style={styles.bentoSmallTitleCenter}>SECTION</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bentoEditInput}
                  value={formData.section}
                  onChangeText={(text) =>
                    setFormData({ ...formData, section: text })
                  }
                  accessible={true}
                  accessibilityLabel="Section"
                />
              ) : (
                <Text style={styles.bentoMediumValue}>
                  {profile.section || "A"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* SKILLS CARD (Green Tint) */}
        <View style={[styles.bentoCard, styles.skillsCard]}>
          <Text style={styles.skillsTitle}>PROFESSIONAL SKILLS</Text>

          {isEditing && (
            <View style={styles.complexInputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: "#fff" }]}>
                <TextInput
                  style={styles.input}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  placeholder="Add skill..."
                  accessible={true}
                  accessibilityLabel="Add skill"
                />
                <TouchableOpacity
                  onPress={addSkill}
                  style={styles.addButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add skill to list"
                >
                  <Feather name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.chipContainer}>
            {formData.skills.map((skill, idx) => (
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
                    <Feather name="x" size={14} color="#065F46" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* BOTTOM ROW: BLOOD GROUP & PHONE */}
        <View style={styles.bentoRow}>
          <View
            style={[
              styles.bentoCard,
              styles.bentoItem,
              { backgroundColor: "#fff" },
            ]}
          >
            <View style={styles.centerContent}>
              <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="droplet" size={20} color="#DC2626" />
              </View>
              <Text style={styles.bentoSmallTitleCenter}>BLOOD GROUP</Text>
              {isEditing ? (
                <TouchableOpacity
                  onPress={() => setBloodGroupModalVisible(true)}
                  style={styles.editPillBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select blood group"
                >
                  <Text style={styles.editPillText}>
                    {formData.bloodGroup || "Select"}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={14}
                    color="#DC2626"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              ) : (
                <Text style={[styles.bentoMediumValue, { color: "#DC2626" }]}>
                  {profile.bloodGroup
                    ? BLOOD_GROUP_TO_UI[profile.bloodGroup]
                    : "N/A"}
                </Text>
              )}
            </View>
          </View>

          <View
            style={[
              styles.bentoCard,
              styles.bentoItem,
              { backgroundColor: "#fff" },
            ]}
          >
            <View style={styles.centerContent}>
              <View style={[styles.iconCircle, { backgroundColor: "#E0E7FF" }]}>
                <Feather name="phone" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.bentoSmallTitleCenter}>PHONE</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bentoEditInput}
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phoneNumber: text })
                  }
                  keyboardType="phone-pad"
                  placeholder="Add Phone"
                  accessible={true}
                  accessibilityLabel="Phone Number"
                />
              ) : (
                <Text style={[styles.bentoMediumValue, { fontSize: 16 }]}>
                  {profile.phoneNumber || "Add Phone"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* SOCIAL LINKS CARD */}
        <View style={styles.socialContainer}>
          {isEditing ? (
            <View style={[styles.bentoCard, { backgroundColor: "#fff" }]}>
              {renderInputRow("LinkedIn URL", "linkedInUrl", "linkedin", {
                autoCapitalize: "none",
                accessibilityLabel: "LinkedIn URL",
              })}
              {renderInputRow("Website URL", "personalWebsiteUrl", "globe", {
                autoCapitalize: "none",
                accessibilityLabel: "Personal Website URL",
              })}
            </View>
          ) : (
            <>
              {profile?.linkedInUrl && (
                <TouchableOpacity
                  style={[styles.bentoCard, styles.linkCard]}
                  onPress={() => openLink(profile.linkedInUrl)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open LinkedIn Profile"
                >
                  <View style={styles.linkRow}>
                    <View style={styles.premiumLinkedInIcon}>
                      <Feather name="linkedin" size={20} color="#fff" />
                    </View>
                    <View style={styles.linkTextContainer}>
                      <Text style={styles.linkTitle}>LINKEDIN PROFILE</Text>
                      <Text style={styles.linkValue} numberOfLines={1}>
                        {profile.linkedInUrl.replace("https://", "")}
                      </Text>
                    </View>
                    <Feather
                      name="arrow-right"
                      size={20}
                      color={colors.outline}
                    />
                  </View>
                </TouchableOpacity>
              )}

              {profile?.personalWebsiteUrl && (
                <TouchableOpacity
                  style={[styles.bentoCard, styles.linkCard]}
                  onPress={() => openLink(profile.personalWebsiteUrl)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open Personal Website"
                >
                  <View style={styles.linkRow}>
                    <View style={styles.holographicIcon}>
                      <Feather name="globe" size={20} color="#fff" />
                    </View>
                    <View style={styles.linkTextContainer}>
                      <Text style={styles.linkTitle}>PERSONAL WEBSITE</Text>
                      <Text style={styles.linkValue} numberOfLines={1}>
                        {profile.personalWebsiteUrl.replace("https://", "")}
                      </Text>
                    </View>
                    <Feather
                      name="arrow-right"
                      size={20}
                      color={colors.outline}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Log out of account"
        >
          <Feather name="log-out" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BLOOD GROUP MODAL */}
      <Modal
        visible={isBloodGroupModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          style={styles.modalOverlay}
          accessibilityViewIsModal={true}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Blood Group</Text>
              <TouchableOpacity
                onPress={() => setBloodGroupModalVisible(false)}
                style={styles.closeButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close blood group selection"
              >
                <Feather name="x" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BLOOD_GROUPS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, bloodGroup: item });
                    setBloodGroupModalVisible(false);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Blood group ${item}`}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.bloodGroup === item && (
                    <Feather
                      name="check"
                      size={20}
                      color={colors.primaryContainer}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fb",
  },
  scrollContent: { paddingHorizontal: 16 },

  // Top Actions
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.5,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  topEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  topEditText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "700",
  },

  // Bento Box Core
  bentoCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    ...shadows.level1,
  },
  bentoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  bentoCol: { flex: 1, gap: 12 },

  bentoItem: {
    flex: 1,
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  bentoItemSmall: {
    flex: 1,
    marginBottom: 0,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  // Specific Card Colors (Pastel theme from image)
  avatarCard: { backgroundColor: "#d0e4ff" },
  academicsCard: { backgroundColor: "#FCE7F3" },
  yellowCard: { backgroundColor: "#FEF08A" },
  blueCard: { backgroundColor: "#E0F2FE" },
  skillsCard: { backgroundColor: "#D1FAE5" },

  // Avatar Section
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative", marginRight: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#131b2e",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarTextContainer: { flex: 1 },
  nameText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#45464d",
    marginTop: 2,
  },
  roleRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rolePillText: {
    fontSize: 12,
    color: "#131b2e",
    marginLeft: 4,
    fontWeight: "700",
  },

  // Academics Section
  iconRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  academicsTitle: {
    fontSize: 12,
    color: "#9D174D",
    marginLeft: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  academicsValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#831843",
    marginLeft: 26,
  },
  dividerPink: {
    height: 1,
    backgroundColor: "rgba(157, 23, 77, 0.1)",
    marginVertical: 12,
  },

  // Grid Typography
  bentoSmallTitleCenter: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "center",
  },
  bentoLargeValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#854D0E",
    textAlign: "center",
  },
  bentoMediumValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#854D0E",
  },

  // FIX: Isolated Input for Grid (No flex:1 or height:100%)
  bentoEditInput: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#131b2e",
    minWidth: 80,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  // NEW: Blood Group Pill
  editPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  editPillText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },

  centerContent: { alignItems: "center", justifyContent: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  // Skills
  skillsTitle: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "700",
  },
  complexInputContainer: { marginBottom: 12 },
  addButton: {
    backgroundColor: "#059669",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // Social Links
  socialContainer: { marginTop: 8 },
  linkCard: { backgroundColor: "#fff", paddingVertical: 16 },
  linkRow: { flexDirection: "row", alignItems: "center" },

  // Custom Link Icons
  premiumLinkedInIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0077b5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0077b5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  holographicIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#21D4FD",
    justifyContent: "center",
    alignItems: "center",
    borderTopColor: "#B721FF",
    borderBottomColor: "#21D4FD",
    borderLeftColor: "#FEE140",
    borderRightColor: "#FA709A",
    borderWidth: 2,
    shadowColor: "#B721FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },

  linkTextContainer: { flex: 1, marginLeft: 16 },
  linkTitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "800",
    letterSpacing: 1,
  },
  linkValue: {
    fontSize: 16,
    color: "#0F172A",
    marginTop: 2,
    fontWeight: "500",
  },

  // Form Editing Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    color: "#45464d",
    marginBottom: 4,
    fontWeight: "700",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 48,
    borderRadius: 9999,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#191c1e",
    fontWeight: "500",
    height: "100%",
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 9999,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "800",
    marginLeft: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#f7f9fb",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "50%",
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
  },
  closeButton: { padding: 4 },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e3e5",
  },
  modalItemText: {
    fontSize: 16,
    color: "#191c1e",
    fontWeight: "700",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131b2e",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    marginBottom: 12,
  },
  retryBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
