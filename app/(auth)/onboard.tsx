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
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

// Added Supabase & Base64 imports
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded } from "../../src/theme/layout";
import { universityPrograms } from "../../src/data/programs";

// Initialize Supabase
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function OnboardScreen() {
  const router = useRouter();

  // Academic Fields
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    if (
      !studentId ||
      !faculty ||
      !department ||
      !program ||
      !batch ||
      !currentSemester ||
      !section
    ) {
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
        faculty,
        department,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about your academic details.
          </Text>
        </View>

        {/* Profile Image Picker */}
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.profileImage} />
            ) : (
              <Feather name="camera" size={32} color={colors.outline} />
            )}
            <View style={styles.imageEditBadge}>
              <Feather name="edit-2" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHelpText}>
            Upload Profile Picture (Optional)
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Student ID *</Text>
          <View style={styles.inputContainer}>
            <Feather
              name="hash"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. 211071011"
              keyboardType="number-pad"
              value={studentId}
              onChangeText={setStudentId}
            />
          </View>

          {/* Program Selector Modal Trigger */}
          <Text style={styles.label}>Academic Program *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setProgramModalVisible(true)}
          >
            <Feather
              name="book"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <Text
              style={[
                styles.input,
                { lineHeight: 22 },
                !program && { color: colors.outlineVariant },
              ]}
              numberOfLines={1}
            >
              {program || "Select your program"}
            </Text>
            <Feather name="chevron-down" size={20} color={colors.outline} />
          </TouchableOpacity>

          <Text style={styles.label}>Faculty *</Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <Feather
              name="book-open"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.onSurfaceVariant }]}
              placeholder="Auto-filled from program"
              value={faculty}
              onChangeText={setFaculty}
              editable={false} // Prevents manual typos since it's auto-filled
            />
          </View>

          <Text style={styles.label}>Department *</Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <Feather
              name="layers"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.onSurfaceVariant }]}
              placeholder="Auto-filled from program"
              value={department}
              onChangeText={setDepartment}
              editable={false}
            />
          </View>

          <Text style={styles.label}>Batch *</Text>
          <View style={styles.inputContainer}>
            <Feather
              name="users"
              size={20}
              color={colors.outline}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. 21st"
              value={batch}
              onChangeText={setBatch}
            />
          </View>

          <View style={{ flexDirection: "row", gap: spacing.stackMd }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Semester *</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="1 to 12"
                  keyboardType="number-pad"
                  value={currentSemester}
                  onChangeText={setCurrentSemester}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Section *</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="grid"
                  size={20}
                  color={colors.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. A"
                  value={section}
                  onChangeText={setSection}
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Blood Group (Optional)</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={bloodGroup}
              onValueChange={setBloodGroup}
              style={styles.picker}
            >
              <Picker.Item
                label="Select Blood Group..."
                value=""
                color={colors.outline}
              />
              <Picker.Item label="A+" value="A_POSITIVE" />
              <Picker.Item label="A-" value="A_NEGATIVE" />
              <Picker.Item label="B+" value="B_POSITIVE" />
              <Picker.Item label="B-" value="B_NEGATIVE" />
              <Picker.Item label="AB+" value="AB_POSITIVE" />
              <Picker.Item label="AB-" value="AB_NEGATIVE" />
              <Picker.Item label="O+" value="O_POSITIVE" />
              <Picker.Item label="O-" value="O_NEGATIVE" />
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleCompleteProfile}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Saving Profile..." : "Complete Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Program Selection Modal */}
      <Modal
        visible={isProgramModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProgramModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Program</Text>
              <TouchableOpacity
                onPress={() => setProgramModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={universityPrograms}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.programItem}
                  onPress={() => {
                    // Auto-fill all three fields when a program is selected!
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: spacing.marginMobile, paddingTop: 60 },
  header: { marginBottom: spacing.stackLg },
  title: {
    ...typography.headlineMd,
    color: colors.primaryContainer,
    fontWeight: "800",
    marginBottom: spacing.stackSm,
  },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant },

  imagePickerContainer: { alignItems: "center", marginBottom: spacing.stackLg },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    borderStyle: "dashed",
    position: "relative",
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 50 },
  imageEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  imageHelpText: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: 12,
  },

  form: { gap: spacing.stackSm },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginTop: spacing.stackSm,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    height: 56, // Ensures all inputs have a uniform touch target
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },

  pickerWrapper: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: rounded.md,
    overflow: "hidden",
  },
  picker: { height: 50, color: colors.onSurface },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: rounded.md,
    alignItems: "center",
    marginTop: spacing.stackLg * 1.5,
    marginBottom: 40,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  // Modal Styles imported from old register.tsx
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 3, 58, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    paddingTop: spacing.sectionBreak,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackLg,
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
  listContainer: {
    paddingBottom: 40,
  },
  programItem: {
    paddingVertical: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  programName: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  programFaculty: {
    ...typography.labelSm,
    color: colors.outline,
  },
});
