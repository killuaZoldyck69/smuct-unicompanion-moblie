import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { decode } from "base64-arraybuffer";
import { createClient } from "@supabase/supabase-js";

import api from "../../services/api";
import { authClient } from "../../services/auth-client";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, rounded, shadows } from "../../theme/layout";
import Toast from "react-native-toast-message";

// 1. Supabase Client for Image Uploads
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

// 2. Fetcher & Updater Functions
const fetchProfile = async () => {
  try {
    const response = await api.get("/students/profile");
    return response.data?.data ?? response.data?.profile ?? null;
  } catch (error) {
    return null;
  }
};

const updateProfile = async (data: any) => {
  const response = await api.patch("/students/profile", data);
  return response.data?.profile ?? response.data?.data;
};

const updateProfileImageAPI = async (imageUrl: string) => {
  const response = await api.patch("/students/profile/image", { imageUrl });
  return response.data.user;
};

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

export default function StudentProfile({ sessionUser }: { sessionUser: any }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  // Complex Input State
  const [skillInput, setSkillInput] = useState("");

  // Editable Form State (Only fields that can be changed)
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

  // Fetch Data using TanStack Query
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: fetchProfile,
    retry: false,
  });

  // Populate form state when data loads
  useEffect(() => {
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
  }, [profile, isEditing]);

  // General Update Mutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      setIsEditing(false);
      Toast.show({ type: "success", text1: "Profile Updated Successfully!" });
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err.message || "Please try again.",
      });
    },
  });

  // --- ACTIONS ---

  const handleSave = () => {
    const payload: any = {};

    // Diffing Logic
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

    // Complex Arrays and Strings
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

    mutation.mutate(payload);
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

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Toast.show({ type: "error", text1: "Cannot open URL" });
  };

  const handleUpdatePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        setIsUploading(true);
        const fileExt = result.assets[0].mimeType?.split("/").pop() || "jpg";
        const safeName =
          profile?.name?.replace(/\s+/g, "").toLowerCase() || "user";
        const fileName = `student-${Date.now()}-${safeName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, decode(result.assets[0].base64), {
            contentType: result.assets[0].mimeType || "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        await updateProfileImageAPI(publicUrlData.publicUrl);

        queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
        Toast.show({ type: "success", text1: "Profile Picture Updated!" });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: error.message,
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await authClient.signOut();
        if (Platform.OS !== "web")
          await SecureStore.deleteItemAsync("better-auth.session_token");
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

  // --- RENDER HELPERS ---

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No student profile found.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderInfoRow = (label: string, value: string, icon: any) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        <Feather name={icon} size={20} color={colors.onSurfaceVariant} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not provided"}</Text>
      </View>
    </View>
  );

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BANNER & AVATAR */}
        <View style={styles.headerBackground}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop",
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay} />
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleUpdatePicture}
            disabled={isUploading}
            style={styles.avatarContainer}
          >
            {profile.image ? (
              <Image source={{ uri: profile.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather
                  name="user"
                  size={40}
                  color={colors.onSurfaceVariant}
                />
              </View>
            )}
            <View style={styles.cameraBadge}>
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Feather name="camera" size={14} color={colors.onPrimary} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.nameText}>{profile.name}</Text>
          <Text style={styles.roleText}>{sessionUser?.role || "STUDENT"}</Text>

          {/* Social Links (View Mode Only) */}
          {!isEditing &&
            (profile?.linkedInUrl || profile?.personalWebsiteUrl) && (
              <View style={styles.socialRow}>
                {profile.linkedInUrl && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => openLink(profile.linkedInUrl)}
                  >
                    <Feather
                      name="linkedin"
                      size={20}
                      color={colors.primaryContainer}
                    />
                  </TouchableOpacity>
                )}
                {profile.personalWebsiteUrl && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => openLink(profile.personalWebsiteUrl)}
                  >
                    <Feather
                      name="globe"
                      size={20}
                      color={colors.primaryContainer}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
        </View>

        {/* 1. IDENTIFICATION CARD (Immutable academic data shown here) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>IDENTIFICATION & ACADEMICS</Text>
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Text style={styles.editActionText}>
                {mutation.isPending ? "Saving..." : isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <>
              {renderInputRow("Full Name", "name", "user")}
              <View style={styles.divider} />
              {/* Note: Academic data is strictly read-only here as per registration rules */}
              {renderInfoRow("University ID", profile.studentId, "credit-card")}
              <View style={styles.divider} />
              {renderInfoRow("Program", profile.program, "book-open")}
            </>
          ) : (
            <>
              {renderInfoRow("University ID", profile.studentId, "credit-card")}
              <View style={styles.divider} />
              {renderInfoRow("Program", profile.program, "book-open")}
              <View style={styles.divider} />
              {renderInfoRow("Faculty", profile.faculty, "layers")}
              <View style={styles.divider} />
              {renderInfoRow("Department", profile.department, "book")}
              <View style={styles.divider} />
              {renderInfoRow("Institutional Email", profile.email, "mail")}
            </>
          )}
        </View>

        {/* 2. ACADEMIC STATUS CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ACADEMIC STATUS</Text>
          {isEditing ? (
            <View style={styles.editForm}>
              {renderInputRow(
                "Current Semester",
                "currentSemester",
                "calendar",
                { keyboardType: "numeric" },
              )}
              {renderInputRow("Section", "section", "users")}
            </View>
          ) : (
            <>
              <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                  <Feather
                    name="award"
                    size={24}
                    color={colors.primaryContainer}
                  />
                  <Text style={styles.gridLabel}>Batch</Text>
                  <Text style={styles.gridValue}>{profile.batch || "N/A"}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Feather
                    name="calendar"
                    size={24}
                    color={colors.primaryContainer}
                  />
                  <Text style={styles.gridLabel}>Semester</Text>
                  <Text style={styles.gridValue}>
                    {profile.currentSemester || "N/A"}
                  </Text>
                </View>
                {/* Section moved to Academic Status Grid! */}
                <View style={styles.gridItem}>
                  <Feather
                    name="users"
                    size={24}
                    color={colors.primaryContainer}
                  />
                  <Text style={styles.gridLabel}>Section</Text>
                  <Text style={styles.gridValue}>
                    {profile.section || "N/A"}
                  </Text>
                </View>
              </View>

              {(profile.isCR || profile.isTA) && (
                <View style={styles.rolesSection}>
                  <Text style={styles.rolesLabel}>Additional Roles</Text>
                  <View style={styles.rolePill}>
                    <Feather
                      name="shield"
                      size={14}
                      color={colors.onSecondaryContainer}
                    />
                    <Text style={styles.rolePillText}>
                      {profile.isCR
                        ? "Class Representative (CR)"
                        : "Teaching Assistant (TA)"}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* 3. SKILLS CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PROFESSIONAL SKILLS</Text>

          {isEditing ? (
            <View style={styles.complexInputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  placeholder="e.g. React Native, Python"
                  placeholderTextColor={colors.outlineVariant}
                />
                <TouchableOpacity onPress={addSkill} style={styles.addButton}>
                  <Feather name="plus" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.chipContainer}>
            {formData.skills.length > 0 ? (
              formData.skills.map((skill, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{skill}</Text>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => removeSkill(skill)}
                      style={{ marginLeft: 6 }}
                    >
                      <Feather
                        name="x"
                        size={14}
                        color={colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.infoLabel}>No skills added.</Text>
            )}
          </View>
        </View>

        {/* 4. PERSONAL & WEB LINKS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>PERSONAL & WEB LINKS</Text>
            {/* Redundant Save button for better UX on long forms */}
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Text style={styles.editActionText}>
                {mutation.isPending ? "Saving..." : isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              {renderInputRow("Phone Number", "phoneNumber", "phone", {
                keyboardType: "phone-pad",
              })}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Blood Group</Text>
                <TouchableOpacity
                  style={[
                    styles.inputWrapper,
                    isBloodGroupModalVisible && {
                      borderColor: colors.primaryContainer,
                    },
                  ]}
                  onPress={() => setBloodGroupModalVisible(true)}
                >
                  <Feather
                    name="droplet"
                    size={18}
                    color={colors.outline}
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.input,
                      { paddingTop: 14 },
                      !formData.bloodGroup && { color: colors.outlineVariant },
                    ]}
                  >
                    {formData.bloodGroup || "Select Blood Group"}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={18}
                    color={colors.outline}
                  />
                </TouchableOpacity>
              </View>

              {renderInputRow("LinkedIn URL", "linkedInUrl", "linkedin", {
                autoCapitalize: "none",
              })}
              {renderInputRow("Website URL", "personalWebsiteUrl", "globe", {
                autoCapitalize: "none",
              })}
            </View>
          ) : (
            <>
              {renderInfoRow("Phone Number", profile.phoneNumber, "phone")}
              <View style={styles.divider} />
              {renderInfoRow(
                "Blood Group",
                profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] : "",
                "droplet",
              )}
            </>
          )}

          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel Editing</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BLOOD GROUP MODAL */}
      <Modal
        visible={isBloodGroupModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Blood Group</Text>
              <TouchableOpacity
                onPress={() => setBloodGroupModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BLOOD_GROUPS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, bloodGroup: item });
                    setBloodGroupModalVisible(false);
                  }}
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
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
  },
  scrollContent: { paddingBottom: spacing.sectionBreak * 2 },
  headerBackground: {
    height: 140,
    width: "100%",
    position: "absolute",
    top: 0,
    backgroundColor: colors.primaryContainer,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  bannerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primaryContainer,
    opacity: 0.85,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: spacing.stackLg,
  },
  avatarContainer: { position: "relative", marginBottom: spacing.stackSm },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: rounded.full,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerLowest,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: colors.primaryContainer,
    width: 32,
    height: 32,
    borderRadius: rounded.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    ...shadows.level1,
  },
  nameText: { ...typography.headlineMd, color: colors.onSurface },
  roleText: {
    ...typography.labelMd,
    color: colors.outline,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.stackMd,
    marginTop: spacing.stackMd,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerLowest,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    marginHorizontal: spacing.marginMobile,
    marginBottom: spacing.stackLg,
    padding: spacing.marginMobile,
    ...shadows.level1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },

  // FIX 1: Added spacing.stackLg margin here to ensure padding below solitary headers!
  cardHeader: {
    ...typography.labelSm,
    color: colors.outline,
    letterSpacing: 1.5,
    marginBottom: spacing.stackLg,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.stackSm,
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: rounded.full,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { ...typography.labelSm, color: colors.outline, marginBottom: 2 },
  infoValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHigh,
    marginVertical: spacing.stackSm,
    marginLeft: 60,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.stackMd,
  },
  gridItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: rounded.lg,
    padding: spacing.stackLg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  gridLabel: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: spacing.stackMd,
    marginBottom: spacing.stackSm,
  },
  gridValue: { ...typography.titleLg, color: colors.onSurface },
  rolesSection: { marginTop: spacing.stackLg },
  rolesLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.stackSm,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.stackMd,
    paddingVertical: 8,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  rolePillText: {
    ...typography.labelMd,
    color: colors.onSecondaryContainer,
    marginLeft: spacing.stackSm,
  },
  editActionText: {
    ...typography.labelMd,
    color: colors.primaryContainer,
    fontWeight: "700",
  },

  // FIX 2: Removed the negative margin (-spacing.stackMd) that was causing text overlap!
  editForm: { marginTop: spacing.stackSm },

  inputGroup: { marginBottom: spacing.stackMd },
  inputLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderColor: colors.outlineVariant,
    height: 48,
    marginTop: spacing.stackSm,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.stackSm,
  },
  inputIcon: { marginRight: spacing.stackMd },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },
  cancelButton: {
    alignItems: "center",
    marginTop: spacing.stackMd,
    padding: spacing.stackSm,
  },
  cancelButtonText: { ...typography.labelMd, color: colors.outline },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.stackSm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.errorContainer,
    borderRadius: rounded.lg,
    paddingVertical: spacing.marginMobile,
    ...shadows.level1,
  },
  logoutText: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
    marginLeft: spacing.stackSm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 3, 58, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "50%",
    paddingTop: spacing.sectionBreak,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackMd,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  modalTitle: { ...typography.titleLg, color: colors.primaryContainer },
  closeButton: { padding: spacing.stackSm },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  modalItemText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "500",
  },
  errorText: {
    ...typography.bodyLg,
    color: colors.error,
    marginBottom: spacing.stackMd,
  },

  // Complex Input Styles
  complexInputContainer: { marginBottom: spacing.stackMd },
  addButton: {
    backgroundColor: colors.primaryContainer,
    width: 36,
    height: 36,
    borderRadius: rounded.sm,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.stackSm,
  },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { ...typography.labelMd, color: colors.onSurface },
});
