import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
  FlatList,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

// Supabase & Base64 imports
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

import api from "../../src/services/api";
import { universityPrograms } from "../../src/data/programs";

// Initialize Supabase
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

// Formatted Blood Groups for our Custom Modal
const bloodGroups = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
];

export default function OnboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Academic Fields
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState(""); // Kept invisibly for backend payload
  const [department, setDepartment] = useState(""); // Kept invisibly for backend payload
  const [program, setProgram] = useState("");
  const [batch, setBatch] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [section, setSection] = useState("");

  // Optional Fields
  const [bloodGroup, setBloodGroup] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProgramModalVisible, setProgramModalVisible] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false); // New Modal State

  // --- LOGIC REMAINS 100% UNTOUCHED ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // 👈 FIX 5: Updated to array format to clear warning
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setImageMimeType(result.assets[0].mimeType || "image/jpeg");
    }
  };

  const handleCompleteProfile = async () => {
    // FIX 2: Faculty and Department are no longer strictly validated in UI since backend handles it
    if (!studentId || !program || !batch || !currentSemester || !section) {
      Toast.show({ type: "error", text1: "Please fill all required fields" });
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl: string | undefined = undefined;

      // 1. Upload Image to Supabase (if selected)
      if (imageUri && imageBase64) {
        const fileExt = imageMimeType.split("/").pop() || "jpg";
        const fileName = `${Date.now()}-${studentId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, decode(imageBase64), {
            contentType: imageMimeType,
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // 2. Create the core student profile
      const onboardPayload = {
        studentId,
        faculty, // Sent just in case backend schema still expects it
        department, // Sent just in case backend schema still expects it
        program,
        batch,
        currentSemester: parseInt(currentSemester, 10),
        section,
      };

      await api.post("/students/onboard", onboardPayload);

      // 3. Patch optional blood group
      if (bloodGroup) {
        try {
          await api.patch("/students/profile", { bloodGroup });
        } catch (e) {
          console.warn("Failed to update blood group.");
        }
      }

      // 4. Patch the newly uploaded Supabase image URL
      if (finalImageUrl) {
        try {
          await api.patch("/students/profile/image", {
            imageUrl: finalImageUrl,
          });
        } catch (e) {
          console.warn("Failed to update profile image.");
        }
      }

      Toast.show({ type: "success", text1: "Profile Completed!" });
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Setup Failed",
        text2:
          error.response?.data?.message ||
          error.message ||
          "Please check your inputs.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Typography */}
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Tell us more about yourself</Text>
          </View>

          {/* Soft Yellow Profile Image Picker */}
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.imagePlaceholder}
              activeOpacity={0.8}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <Feather name="camera" size={32} color="#565e74" />
              )}
              <View style={styles.imageEditBadge}>
                <Feather name="plus" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* --- BENTO BOX 1: Academic Identity (Soft Blue) --- */}
          <View style={[styles.bentoBox, { backgroundColor: "#d0e4ff" }]}>
            <View style={styles.inputWrapper}>
              <Feather
                name="hash"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Student ID"
                placeholderTextColor="#76777d"
                keyboardType="number-pad"
                value={studentId}
                onChangeText={setStudentId}
              />
            </View>

            {/* FIX 1: Perfect Alignment and added Dropdown Icon */}
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setProgramModalVisible(true)}
            >
              <Feather
                name="book"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <Text
                style={[styles.dropdownText, !program && { color: "#76777d" }]}
                numberOfLines={1}
              >
                {program || "Academic Program"}
              </Text>
              <Feather name="chevron-down" size={20} color="#76777d" />
            </TouchableOpacity>

            {/* FIX 2: Faculty & Department Removed from UI completely */}
          </View>

          {/* --- BENTO BOX 2: Class Details (Soft Mint) --- */}
          <View style={[styles.bentoBox, { backgroundColor: "#c3f0d2" }]}>
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Feather
                  name="calendar"
                  size={20}
                  color="#76777d"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Semester"
                  placeholderTextColor="#76777d"
                  keyboardType="number-pad"
                  value={currentSemester}
                  onChangeText={setCurrentSemester}
                />
              </View>

              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Feather
                  name="grid"
                  size={20}
                  color="#76777d"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Section"
                  placeholderTextColor="#76777d"
                  value={section}
                  onChangeText={setSection}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Feather
                name="users"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Batch"
                placeholderTextColor="#76777d"
                value={batch}
                onChangeText={setBatch}
              />
            </View>
          </View>

          {/* --- BENTO BOX 3: Personal (Soft Rose) --- */}
          {/* FIX 4: Implemented Custom Blood Group Dropdown UI */}
          <View style={[styles.bentoBox, { backgroundColor: "#ffdad6" }]}>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setBloodGroupModalVisible(true)}
            >
              <Feather
                name="droplet"
                size={20}
                color="#76777d"
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.dropdownText,
                  !bloodGroup && { color: "#76777d" },
                ]}
                numberOfLines={1}
              >
                {bloodGroup
                  ? bloodGroups.find((b) => b.value === bloodGroup)?.label
                  : "Blood Group"}
              </Text>
              <Feather name="chevron-down" size={20} color="#76777d" />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleCompleteProfile}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Saving Profile..." : "Complete Profile"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Program Selection Modal */}
      <Modal
        visible={isProgramModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Program</Text>
              <TouchableOpacity onPress={() => setProgramModalVisible(false)}>
                <Feather name="x" size={24} color="#131b2e" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={universityPrograms}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              // FIX 3: Added dynamic padding bottom for navigation bar gap
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.programItem}
                  onPress={() => {
                    // Hidden state tracking kept intact
                    setProgram(item.name);
                    setFaculty(item.faculty);
                    setDepartment(item.department);
                    setProgramModalVisible(false);
                  }}
                >
                  <Text style={styles.programName}>{item.name}</Text>
                  <Text style={styles.programFaculty}>
                    {item.faculty} • {item.department}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* NEW: Blood Group Selection Modal */}
      <Modal
        visible={isBloodGroupModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Blood Group</Text>
              <TouchableOpacity
                onPress={() => setBloodGroupModalVisible(false)}
              >
                <Feather name="x" size={24} color="#131b2e" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={bloodGroups}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              // FIX 3: Added dynamic padding bottom for navigation bar gap
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.programItem}
                  onPress={() => {
                    setBloodGroup(item.value);
                    setBloodGroupModalVisible(false);
                  }}
                >
                  <Text style={[styles.programName, { fontSize: 18 }]}>
                    {item.label}
                  </Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f9fb", // surface-bright
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },

  // Header
  header: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 28,
    fontWeight: "800",
    color: "#131b2e", // Deep Navy
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#45464d",
  },

  // Image Picker (Yellow)
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 9999,
    backgroundColor: "#f2e580", // Soft yellow
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  imageEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: "#131b2e", // Deep navy badge
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#f7f9fb",
  },

  // Bento Boxes
  bentoBox: {
    width: "100%",
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    gap: 16, // Spacing between inputs inside the box
  },

  // Inputs
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff", // Pure white pills
    borderRadius: 9999,
    paddingHorizontal: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#191c1e",
    height: "100%",
  },
  dropdownText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#191c1e",
  },

  // Submit Button
  submitButton: {
    backgroundColor: "#131b2e", // Deep Navy
    borderRadius: 9999,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#f7f9fb",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "70%",
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
    fontFamily: "Plus Jakarta Sans",
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
  },
  programItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e3e5",
  },
  programName: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#191c1e",
    marginBottom: 4,
  },
  programFaculty: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "600",
    color: "#76777d",
  },
});
