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
  Linking,
  Modal,
  FlatList,
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
import { useTeacherProfile } from "@/features/profile/useTeacherProfile";

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
  const insets = useSafeAreaInsets();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- UI States ---
  const [isEditing, setIsEditing] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  // --- Complex Input States ---
  const [expertiseInput, setExpertiseInput] = useState("");
  const [qualDegreeInput, setQualDegreeInput] = useState("");
  const [qualInstInput, setQualInstInput] = useState("");

  // --- Form State ---
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

  // --- Feature Hook ---
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

  const populateFormData = () => {
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
        officeRoom: (profile as any).officeRoom || profile.roomNumber || "",
        consultationHours: (profile as any).consultationHours || "",
        expertiseFields: (profile as any).expertiseFields || profile.researchInterests || [],
        academicQualifications: (profile as any).academicQualifications || {},
        linkedInUrl: profile.linkedInUrl || "",
        personalWebsiteUrl: profile.personalWebsiteUrl || "",
      });
    }
  };

  useEffect(() => {
    populateFormData();
  }, [profile, isEditing]);

  const handleCancel = () => {
    populateFormData();
    setIsEditing(false);
  };

  // --- Handlers ---
  const handleSave = () => {
    const payload: any = {};

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (key === "bloodGroup") {
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
        if (
          JSON.stringify(formData[key]) !==
          JSON.stringify(
            (profile as any)[key] || (Array.isArray(formData[key]) ? [] : {}),
          )
        ) {
          payload[key] = formData[key];
        }
      } else {
        if (formData[key] !== ((profile as any)[key] || "")) {
          payload[key] = formData[key];
        }
      }
    });

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

  const openLink = async (url?: string | null) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Toast.show({ type: "error", text1: "Cannot open URL" });
  };

  const handleUpdatePicture = async () => {
    const safeName = (profile?.name || sessionUser?.name || "teacher")
      .replace(/\s+/g, "")
      .toLowerCase();
    await pickAndUploadAvatar(safeName);
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      await authClient.signOut();
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync("better-auth.session_token");
        await SecureStore.deleteItemAsync("better-auth_cookie");
        await SecureStore.deleteItemAsync("better-auth_session_data");
      }
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#131b2e" />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <Text style={styles.errorText}>No teacher profile found.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Top Header Actions */}
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
              accessibilityLabel="Cancel edit profile"
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
            accessibilityLabel={isEditing ? "Save profile changes" : "Edit Profile"}
          >
            <Feather
              name={isEditing ? "check" : "edit-2"}
              size={16}
              color="#131b2e"
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
        {/* 1. AVATAR & BASIC INFO CARD (Light Blue) */}
        <View style={[styles.bentoCard, styles.avatarCard]}>
          <View style={styles.avatarSection}>
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
                  accessibilityLabel="Teacher profile photo"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather name="user" size={40} color="#76777d" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="camera" size={14} color="#fff" />
                )}
              </View>
            </TouchableOpacity>

            {isEditing ? (
              <TextInput
                style={[
                  styles.bentoEditInput,
                  { marginTop: 12, minWidth: 200 },
                ]}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Full Name"
                accessible={true}
                accessibilityLabel="Full Name"
              />
            ) : (
              <Text style={styles.nameText}>
                {profile.name || sessionUser?.name}
              </Text>
            )}

            <View style={styles.designationBadge}>
              <Feather name="star" size={12} color="#854D0E" />
              <Text style={styles.designationText}>
                {profile.designation || "Faculty"}
              </Text>
            </View>

            <Text style={styles.departmentText}>
              {profile.department || "University Department"}
            </Text>
          </View>
        </View>

        {/* 2. GRID ROW: TEACHER ID (Mint) & BLOOD GROUP (Rose) */}
        <View style={styles.bentoRow}>
          <View style={[styles.bentoCard, styles.bentoItem, styles.mintCard]}>
            <View style={styles.gridIconRow}>
              <Feather name="hash" size={16} color="#065F46" />
              <Text style={styles.bentoSmallTitleMint}>TEACHER ID</Text>
            </View>
            <Text style={styles.bentoMediumValueMint}>{profile.teacherId}</Text>
          </View>

          <View style={[styles.bentoCard, styles.bentoItem, styles.roseCard]}>
            <View style={styles.gridIconRow}>
              <Feather name="droplet" size={16} color="#9D174D" />
              <Text style={styles.bentoSmallTitleRose}>BLOOD GROUP</Text>
            </View>
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
              <Text style={styles.bentoMediumValueRose}>
                {profile.bloodGroup
                  ? BLOOD_GROUP_TO_UI[profile.bloodGroup]
                  : "N/A"}
              </Text>
            )}
          </View>
        </View>

        {/* 3. ACADEMIC & OFFICE (Yellow Card) */}
        <View style={[styles.bentoCard, styles.yellowCard]}>
          {isEditing && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.bentoSmallTitleYellow}>
                DESIGNATION & DEPT
              </Text>
              <TextInput
                style={[styles.bentoEditInput, { marginBottom: 8 }]}
                value={formData.designation}
                onChangeText={(text) =>
                  setFormData({ ...formData, designation: text })
                }
                placeholder="Designation"
                accessible={true}
                accessibilityLabel="Designation"
              />
              <TextInput
                style={styles.bentoEditInput}
                value={formData.department}
                onChangeText={(text) =>
                  setFormData({ ...formData, department: text })
                }
                placeholder="Department"
                accessible={true}
                accessibilityLabel="Department"
              />
            </View>
          )}

          <View style={styles.yellowInfoRow}>
            <View style={styles.yellowIconCircle}>
              <Feather name="home" size={18} color="#854D0E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowLabel}>Faculty</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bentoEditInputLeft}
                  value={formData.faculty}
                  onChangeText={(text) =>
                    setFormData({ ...formData, faculty: text })
                  }
                  placeholder="Faculty"
                  accessible={true}
                  accessibilityLabel="Faculty"
                />
              ) : (
                <Text style={styles.yellowValue}>
                  {profile.faculty || "Not provided"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.yellowInfoRow}>
            <View style={styles.yellowIconCircle}>
              <Feather name="map-pin" size={18} color="#854D0E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowLabel}>Location</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bentoEditInputLeft}
                  value={formData.officeRoom}
                  onChangeText={(text) =>
                    setFormData({ ...formData, officeRoom: text })
                  }
                  placeholder="Office Room"
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

          <View style={styles.consultationBox}>
            <View style={styles.yellowIconCircle}>
              <Feather name="clock" size={18} color="#854D0E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowLabel}>Consultation Hours</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bentoEditInputLeft}
                  value={formData.consultationHours}
                  onChangeText={(text) =>
                    setFormData({ ...formData, consultationHours: text })
                  }
                  placeholder="e.g. Mon-Wed, 10:00 AM"
                  accessible={true}
                  accessibilityLabel="Consultation Hours"
                />
              ) : (
                <Text style={styles.yellowValue}>
                  {(profile as any).consultationHours || (profile.officeHours ? "Office hours available" : "Not provided")}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 4. EXPERTISE & QUALIFICATIONS (White Card) */}
        <View style={[styles.bentoCard, styles.whiteCard]}>
          {/* Expertise */}
          <View style={styles.sectionHeaderRow}>
            <Feather name="star" size={20} color="#131b2e" />
            <Text style={styles.sectionTitle}>Professional Expertise</Text>
          </View>

          {isEditing && (
            <View style={styles.complexInputRow}>
              <TextInput
                style={styles.pillInput}
                value={expertiseInput}
                onChangeText={setExpertiseInput}
                placeholder="Add expertise..."
                accessible={true}
                accessibilityLabel="Add expertise input"
              />
              <TouchableOpacity
                onPress={addExpertise}
                style={styles.addButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add expertise field"
              >
                <Feather name="plus" size={18} color="#fff" />
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
                      accessibilityLabel={`Remove expertise ${field}`}
                    >
                      <Feather name="x" size={14} color="#131b2e" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No expertise added.</Text>
            )}
          </View>

          <View style={styles.dividerLight} />

          {/* Qualifications */}
          <View style={styles.sectionHeaderRow}>
            <Feather name="award" size={20} color="#131b2e" />
            <Text style={styles.sectionTitle}>Qualifications</Text>
          </View>

          {isEditing && (
            <View style={styles.qualInputContainer}>
              <TextInput
                style={[styles.pillInput, { marginBottom: 8 }]}
                value={qualDegreeInput}
                onChangeText={setQualDegreeInput}
                placeholder="Degree (e.g. M.Sc in CS)"
                accessible={true}
                accessibilityLabel="Degree input"
              />
              <View style={styles.complexInputRow}>
                <TextInput
                  style={styles.pillInput}
                  value={qualInstInput}
                  onChangeText={setQualInstInput}
                  placeholder="Institution Name"
                  accessible={true}
                  accessibilityLabel="Institution input"
                />
                <TouchableOpacity
                  onPress={addQualification}
                  style={styles.addButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add qualification"
                >
                  <Feather name="plus" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ marginTop: 8 }}>
            {Object.entries(formData.academicQualifications).length > 0 ? (
              Object.entries(formData.academicQualifications).map(
                ([degree, inst], idx) => (
                  <View key={idx} style={styles.qualRow}>
                    <View style={styles.bulletPoint} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qualDegreeText}>{degree}</Text>
                      <Text style={styles.qualInstText}>{inst}</Text>
                    </View>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={() => removeQualification(degree)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove qualification ${degree}`}
                      >
                        <Feather name="trash-2" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ),
              )
            ) : (
              <Text style={styles.emptyText}>No qualifications added.</Text>
            )}
          </View>
        </View>

        {/* 5. CONTACT & LINKS (White Card) */}
        <View style={[styles.bentoCard, styles.whiteCard]}>
          <View style={styles.contactRow}>
            <View
              style={[styles.contactIconCircle, { backgroundColor: "#e0e7ff" }]}
            >
              <Feather name="mail" size={18} color="#4f46e5" />
            </View>
            <Text style={styles.contactText}>
              {profile.email || "No email"}
            </Text>
          </View>

          <View style={styles.contactRow}>
            <View
              style={[styles.contactIconCircle, { backgroundColor: "#d1fae5" }]}
            >
              <Feather name="phone" size={18} color="#059669" />
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.bentoEditInputLeft, { flex: 1 }]}
                value={formData.phoneNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, phoneNumber: text })
                }
                keyboardType="phone-pad"
                placeholder="Phone Number"
                accessible={true}
                accessibilityLabel="Phone Number"
              />
            ) : (
              <Text style={styles.contactText}>
                {profile.phoneNumber || "Not provided"}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.contactRow}
            disabled={isEditing || !profile.personalWebsiteUrl}
            onPress={() => openLink(profile.personalWebsiteUrl)}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="Open personal website"
          >
            <View
              style={[styles.contactIconCircle, { backgroundColor: "#e0f2fe" }]}
            >
              <Feather name="globe" size={18} color="#0284c7" />
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.bentoEditInputLeft, { flex: 1 }]}
                value={formData.personalWebsiteUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, personalWebsiteUrl: text })
                }
                autoCapitalize="none"
                placeholder="Website URL"
                accessible={true}
                accessibilityLabel="Website URL"
              />
            ) : (
              <Text
                style={[
                  styles.contactText,
                  profile.personalWebsiteUrl && styles.linkTextActive,
                ]}
              >
                {profile.personalWebsiteUrl ? "Personal Website" : "No Website"}
              </Text>
            )}
          </TouchableOpacity>

          {(isEditing || profile.linkedInUrl) && (
            <TouchableOpacity
              style={[
                styles.contactRow,
                { borderBottomWidth: 0, paddingBottom: 0 },
              ]}
              disabled={isEditing || !profile.linkedInUrl}
              onPress={() => openLink(profile.linkedInUrl)}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel="Open LinkedIn profile"
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: "#0077b520" },
                ]}
              >
                <Feather name="linkedin" size={18} color="#0077b5" />
              </View>
              {isEditing ? (
                <TextInput
                  style={[styles.bentoEditInputLeft, { flex: 1 }]}
                  value={formData.linkedInUrl}
                  onChangeText={(text) =>
                    setFormData({ ...formData, linkedInUrl: text })
                  }
                  autoCapitalize="none"
                  placeholder="LinkedIn URL"
                  accessible={true}
                  accessibilityLabel="LinkedIn URL"
                />
              ) : (
                <Text
                  style={[
                    styles.contactText,
                    profile.linkedInUrl && styles.linkTextActive,
                  ]}
                >
                  {profile.linkedInUrl ? "LinkedIn Profile" : "No LinkedIn"}
                </Text>
              )}
            </TouchableOpacity>
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
        <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
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
                <Feather name="x" size={24} color="#131b2e" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BLOOD_GROUPS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, bloodGroup: item });
                    setBloodGroupModalVisible(false);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Select blood group ${item}`}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.bloodGroup === item && (
                    <Feather name="check" size={20} color="#131b2e" />
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

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
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
  actionButtonsRow: { flexDirection: "row", alignItems: "center" },
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
    color: "#131b2e",
  },

  // Bento Box Core
  bentoCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 12,
    ...shadows.level1,
  },
  bentoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  bentoItem: {
    flex: 1,
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
  },

  whiteCard: { backgroundColor: "#ffffff" },
  avatarCard: {
    backgroundColor: "#d0e4ff",
    alignItems: "center",
    paddingTop: 32,
  },
  mintCard: { backgroundColor: "#c3f0d2" },
  roseCard: { backgroundColor: "#ffdad6" },
  yellowCard: { backgroundColor: "#fef08a" },

  // Avatar Section
  avatarSection: { alignItems: "center" },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#131b2e",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#131b2e",
    textAlign: "center",
  },
  designationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2e580",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 8,
  },
  designationText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#854D0E",
    marginLeft: 6,
  },
  departmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#45464d",
    marginTop: 12,
    textAlign: "center",
  },

  // Grid Styles (Mint/Rose)
  gridIconRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  bentoSmallTitleMint: {
    fontSize: 12,
    fontWeight: "800",
    color: "#065F46",
    marginLeft: 6,
    letterSpacing: 1,
  },
  bentoMediumValueMint: {
    fontSize: 24,
    fontWeight: "800",
    color: "#064E3B",
  },
  bentoSmallTitleRose: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9D174D",
    marginLeft: 6,
    letterSpacing: 1,
  },
  bentoMediumValueRose: {
    fontSize: 24,
    fontWeight: "800",
    color: "#831843",
  },

  // Yellow Card Styles
  bentoSmallTitleYellow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#854D0E",
    letterSpacing: 1,
    marginBottom: 8,
  },
  yellowInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  yellowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  yellowLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#854D0E",
    marginBottom: 2,
  },
  yellowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#191c1e",
  },
  consultationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
    padding: 12,
  },

  // White Card Styles (Expertise & Quals)
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#131b2e",
    marginLeft: 8,
  },
  dividerLight: { height: 1, backgroundColor: "#e0e3e5", marginVertical: 20 },
  emptyText: {
    fontSize: 14,
    color: "#76777d",
    fontStyle: "italic",
  },

  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f4f6",
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
  },

  qualRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4f46e5",
    marginTop: 8,
    marginRight: 12,
  },
  qualDegreeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#131b2e",
  },
  qualInstText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#45464d",
    marginTop: 2,
  },

  // Contact Links
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f4f6",
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#191c1e",
    flex: 1,
  },
  linkTextActive: { color: "#0284c7" },

  // Edit Mode Inputs
  bentoEditInput: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#131b2e",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  bentoEditInputLeft: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#131b2e",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  editPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  editPillText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#DC2626",
  },
  complexInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  qualInputContainer: {
    backgroundColor: "#f7f9fb",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  pillInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 9999,
    height: 44,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addButton: {
    backgroundColor: "#131b2e",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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
});
