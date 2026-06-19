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
  Linking,
  Modal,
  FlatList,
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

// --- Supabase Initialization ---
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

const updateProfileImageAPI = async (imageUrl: string) => {
  const response = await api.patch("/teachers/profile/image", { imageUrl });
  return response.data;
};

// --- Blood Group Mappers ---
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

export default function TeacherProfile({ sessionUser }: { sessionUser: any }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // --- UI States ---
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  // --- Complex Input States ---
  const [expertiseInput, setExpertiseInput] = useState("");
  const [qualDegreeInput, setQualDegreeInput] = useState("");
  const [qualInstInput, setQualInstInput] = useState("");

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    bloodGroup: "", // Stores UI version ("A+")
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

  // --- Data Fetching ---
  const { data: profile, isLoading } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: async () => {
      try {
        const res = await api.get("/teachers/profile");
        return res.data?.data ?? null;
      } catch (e) {
        return null;
      }
    },
    retry: false,
  });

  // Populate form on load
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup
          ? BLOOD_GROUP_TO_UI[profile.bloodGroup]
          : "",
        designation: profile.designation || "",
        department: profile.department || "",
        faculty: profile.faculty || "",
        officeRoom: profile.officeRoom || "",
        consultationHours: profile.consultationHours || "",
        expertiseFields: profile.expertiseFields || [],
        academicQualifications: profile.academicQualifications || {},
        linkedInUrl: profile.linkedInUrl || "",
        personalWebsiteUrl: profile.personalWebsiteUrl || "",
      });
    }
  }, [profile, isEditing]);

  // --- Mutations ---
  const mutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.patch("/teachers/profile", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
      setIsEditing(false);
      Toast.show({ type: "success", text1: "Profile Updated Successfully!" });
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  // --- Handlers ---
  const handleSave = () => {
    const payload: any = {};

    // Strict Diffing Logic: Only attach modified fields
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (key === "bloodGroup") {
        // Map back to DB enum format and diff
        const mappedDBValue = formData.bloodGroup
          ? BLOOD_GROUP_TO_DB[formData.bloodGroup]
          : undefined;
        if (
          mappedDBValue !== profile?.bloodGroup &&
          mappedDBValue !== undefined
        ) {
          payload.bloodGroup = mappedDBValue;
        }
      } else if (typeof formData[key] === "object") {
        // Diff objects/arrays
        if (
          JSON.stringify(formData[key]) !==
          JSON.stringify(
            profile[key] || (Array.isArray(formData[key]) ? [] : {}),
          )
        ) {
          payload[key] = formData[key];
        }
      } else {
        // Diff simple strings
        if (formData[key] !== (profile[key] || "")) {
          payload[key] = formData[key];
        }
      }
    });

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return; // No changes made
    }

    mutation.mutate(payload);
  };

  // Complex Field Handlers
  const addExpertise = () => {
    if (
      !expertiseInput.trim() ||
      formData.expertiseFields.includes(expertiseInput.trim())
    )
      return;
    setFormData({
      ...formData,
      expertiseFields: [...formData.expertiseFields, expertiseInput.trim()],
    });
    setExpertiseInput("");
  };

  const removeExpertise = (field: string) => {
    setFormData({
      ...formData,
      expertiseFields: formData.expertiseFields.filter((f) => f !== field),
    });
  };

  const addQualification = () => {
    if (!qualDegreeInput.trim() || !qualInstInput.trim()) return;
    setFormData({
      ...formData,
      academicQualifications: {
        ...formData.academicQualifications,
        [qualDegreeInput.trim()]: qualInstInput.trim(),
      },
    });
    setQualDegreeInput("");
    setQualInstInput("");
  };

  const removeQualification = (degree: string) => {
    const newQuals = { ...formData.academicQualifications };
    delete newQuals[degree];
    setFormData({ ...formData, academicQualifications: newQuals });
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
        const safeName = (profile?.name || sessionUser?.name || "teacher")
          .replace(/\s+/g, "")
          .toLowerCase();
        const fileName = `teacher-${Date.now()}-${safeName}.${fileExt}`;
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
        queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
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
      await authClient.signOut();
      if (Platform.OS !== "web")
        await SecureStore.deleteItemAsync("better-auth.session_token");
      router.replace("/(auth)/login");
    };
    if (Platform.OS === "web") {
      if (window.confirm("Log out?")) performLogout();
    } else {
      Alert.alert("Log Out", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: performLogout },
      ]);
    }
  };

  // --- Render Helpers ---
  if (isLoading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );

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
      <Text style={styles.infoLabel}>{label}</Text>
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
        {/* HEADER & AVATAR */}
        <View style={styles.headerBackground} />

        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleUpdatePicture}
            disabled={isUploading}
            style={styles.avatarContainer}
          >
            {profile?.image ? (
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
          <Text style={styles.nameText}>
            {profile?.name || sessionUser?.name}
          </Text>
          <Text style={styles.roleText}>
            {profile?.designation} • {profile?.department}
          </Text>

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

        {/* 1. IDENTIFICATION CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>IDENTIFICATION</Text>
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Text style={styles.editActionText}>
                {mutation.isPending ? "Saving..." : isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {renderInfoRow("Teacher ID", profile?.teacherId, "hash")}
          <View style={styles.divider} />
          {renderInfoRow("Institutional Email", profile?.email, "mail")}
          <View style={styles.divider} />
          {isEditing
            ? renderInputRow("Full Name", "name", "user")
            : renderInfoRow("Full Name", profile?.name, "user")}
        </View>

        {/* 2. ACADEMIC & OFFICE DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ACADEMIC & OFFICE</Text>
          {isEditing ? (
            <>
              {renderInputRow("Faculty", "faculty", "layers")}
              {renderInputRow("Department", "department", "book")}
              {renderInputRow("Designation", "designation", "award")}
              {renderInputRow("Office Room", "officeRoom", "map-pin")}
              {renderInputRow(
                "Consultation Hours",
                "consultationHours",
                "clock",
              )}
            </>
          ) : (
            <>
              {renderInfoRow("Faculty", profile?.faculty, "layers")}
              <View style={styles.divider} />
              {renderInfoRow("Office Room", profile?.officeRoom, "map-pin")}
              <View style={styles.divider} />
              {renderInfoRow(
                "Consultation Hours",
                profile?.consultationHours,
                "clock",
              )}
            </>
          )}
        </View>

        {/* 3. EXPERTISE & QUALIFICATIONS (COMPLEX DATA) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PROFESSIONAL EXPERTISE</Text>

          {isEditing ? (
            <View style={styles.complexInputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={expertiseInput}
                  onChangeText={setExpertiseInput}
                  placeholder="e.g. Data Science"
                  placeholderTextColor={colors.outlineVariant}
                />
                <TouchableOpacity
                  onPress={addExpertise}
                  style={styles.addButton}
                >
                  <Feather name="plus" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.chipContainer}>
            {formData.expertiseFields.length > 0 ? (
              formData.expertiseFields.map((field, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{field}</Text>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => removeExpertise(field)}
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
              <Text style={styles.infoLabel}>No expertise fields added.</Text>
            )}
          </View>

          <View style={[styles.divider, { marginTop: spacing.stackLg }]} />
          <Text style={[styles.cardHeader, { marginTop: spacing.stackLg }]}>
            ACADEMIC QUALIFICATIONS
          </Text>

          {isEditing && (
            <View style={styles.complexInputContainer}>
              <View
                style={[styles.inputWrapper, { marginBottom: spacing.stackSm }]}
              >
                <TextInput
                  style={styles.input}
                  value={qualDegreeInput}
                  onChangeText={setQualDegreeInput}
                  placeholder="Degree (e.g. M.Sc)"
                  placeholderTextColor={colors.outlineVariant}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={qualInstInput}
                  onChangeText={setQualInstInput}
                  placeholder="Institution"
                  placeholderTextColor={colors.outlineVariant}
                />
                <TouchableOpacity
                  onPress={addQualification}
                  style={styles.addButton}
                >
                  <Feather name="plus" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ marginTop: spacing.stackSm }}>
            {Object.entries(formData.academicQualifications).length > 0 ? (
              Object.entries(formData.academicQualifications).map(
                ([degree, inst], idx) => (
                  <View key={idx} style={styles.qualRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qualDegreeText}>{degree}</Text>
                      <Text style={styles.infoLabel}>{inst}</Text>
                    </View>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={() => removeQualification(degree)}
                      >
                        <Feather
                          name="trash-2"
                          size={18}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ),
              )
            ) : (
              <Text style={styles.infoLabel}>No qualifications added.</Text>
            )}
          </View>
        </View>

        {/* 4. PERSONAL & SOCIAL INFO */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>PERSONAL & WEB LINKS</Text>
          {isEditing ? (
            <>
              {renderInputRow("Phone Number", "phoneNumber", "phone", {
                keyboardType: "phone-pad",
              })}

              {/* Dynamic Blood Group Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.infoLabel}>Blood Group</Text>
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
            </>
          ) : (
            <>
              {renderInfoRow("Phone Number", profile?.phoneNumber, "phone")}
              <View style={styles.divider} />
              {/* Maps DB Enum back to UI on initial fetch load automatically */}
              {renderInfoRow(
                "Blood Group",
                profile?.bloodGroup
                  ? BLOOD_GROUP_TO_UI[profile.bloodGroup]
                  : "",
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
  nameText: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginTop: spacing.stackMd,
  },
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
  editActionText: {
    ...typography.labelMd,
    color: colors.primaryContainer,
    fontWeight: "700",
  },
  inputGroup: { marginBottom: spacing.stackMd },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    height: 48,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.stackSm,
    marginTop: spacing.stackSm,
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
  qualRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: spacing.stackMd,
    borderRadius: rounded.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  qualDegreeText: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurface,
  },

  // Modal Styles
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
});
