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

// 1. Supabase Initialization
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

// 2. API Call for Image Update
const updateProfileImageAPI = async (imageUrl: string) => {
  const response = await api.patch("/teachers/profile/image", { imageUrl });
  return response.data;
};

// 3. Data Mappers
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

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    bloodGroup: "",
    designation: "",
    department: "",
    officeRoom: "",
    consultationHours: "",
    specialization: "",
  });

  // Fetch Teacher Data
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

  // Sync state with fetched data
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
        officeRoom: profile.officeRoom || "",
        consultationHours: profile.consultationHours || "",
        specialization: profile.specialization || "",
      });
    }
  }, [profile]);

  // Patch Mutation
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

  // --- ACTIONS ---

  const handleSave = () => {
    // 1. Build payload without bloodGroup to avoid Zod validation errors on empty fields
    const payload: any = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      designation: formData.designation,
      department: formData.department,
      officeRoom: formData.officeRoom,
      consultationHours: formData.consultationHours,
      specialization: formData.specialization,
    };

    // 2. Only attach bloodGroup if it has a valid selected value
    if (formData.bloodGroup) {
      payload.bloodGroup = BLOOD_GROUP_TO_DB[formData.bloodGroup];
    }

    mutation.mutate(payload);
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

  // --- RENDER HELPERS ---

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
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
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholderTextColor={colors.outlineVariant}
          {...options}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER & AVATAR */}
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

            {/* Camera Overlay Badge */}
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
            {profile?.designation || "FACULTY"}
          </Text>
        </View>

        {/* 1. FACULTY ID CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>FACULTY IDENTIFICATION</Text>
          {renderInfoRow("Department", profile?.department, "briefcase")}
          <View style={styles.divider} />
          {renderInfoRow("Institutional Email", profile?.email, "mail")}
        </View>

        {/* 2. PROFESSIONAL DETAILS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>PROFESSIONAL DETAILS</Text>
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
              {renderInputRow("Designation", "designation", "award")}
              {renderInputRow("Specialization", "specialization", "star")}
              {renderInputRow(
                "Consultation Hours",
                "consultationHours",
                "clock",
              )}
            </View>
          ) : (
            <>
              {renderInfoRow("Designation", profile?.designation, "award")}
              <View style={styles.divider} />
              {renderInfoRow("Specialization", profile?.specialization, "star")}
              <View style={styles.divider} />
              {renderInfoRow(
                "Consultation Hours",
                profile?.consultationHours,
                "clock",
              )}
            </>
          )}
        </View>

        {/* 3. PERSONAL INFO CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeader}>PERSONAL INFO</Text>
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
              {renderInputRow("Full Name", "name", "user")}
              {renderInputRow("Phone Number", "phoneNumber", "phone")}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Blood Group</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
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

              {renderInputRow("Office Room", "officeRoom", "map-pin")}
            </View>
          ) : (
            <>
              {renderInfoRow("Phone Number", profile?.phoneNumber, "phone")}
              <View style={styles.divider} />
              {renderInfoRow(
                "Blood Group",
                profile?.bloodGroup
                  ? BLOOD_GROUP_TO_UI[profile?.bloodGroup]
                  : "",
                "droplet",
              )}
              <View style={styles.divider} />
              {renderInfoRow("Office Room", profile?.officeRoom, "map-pin")}
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

        {/* LOGOUT */}
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
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: colors.primaryContainer,
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
    backgroundColor: colors.surfaceContainer,
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
  editForm: { marginTop: -spacing.stackMd },
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
  cancelButtonText: {
    ...typography.labelMd,
    color: colors.outline,
  },
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
  modalTitle: {
    ...typography.titleLg,
    color: colors.primaryContainer,
  },
  closeButton: {
    padding: spacing.stackSm,
  },
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
