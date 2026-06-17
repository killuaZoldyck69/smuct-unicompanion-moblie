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
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded } from "../../src/theme/layout";
import { universityPrograms } from "../../src/data/programs";
import Toast from "react-native-toast-message";
import { authClient } from "../../src/services/auth-client";
import api from "../../src/services/api";
import { decode } from "base64-arraybuffer";
import { createClient } from "@supabase/supabase-js";

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [batch, setBatch] = useState("");

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isDepartmentModalVisible, setDepartmentModalVisible] = useState(false);

  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
      setImageMimeType(result.assets[0].mimeType || "image/jpeg");
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match." });
      return;
    }

    try {
      let finalImageUrl: string | undefined = undefined;

      if (imageUri && imageBase64) {
        const fileExt = imageMimeType.split("/").pop() || "jpg";
        const safeName = fullName.replace(/\s+/g, "").toLowerCase() || "user";
        const fileName = `${Date.now()}-${safeName}.${fileExt}`;

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

      const { data: authData, error: authError } =
        await authClient.signUp.email({
          email,
          password,
          name: fullName,
          image: finalImageUrl,
        });

      if (authError || !authData?.user?.id) {
        throw new Error(authError?.message || "Account creation failed.");
      }

      const sessionToken = (authData as any).token;

      await api.post(
        "/students/onboard",
        {
          studentId,
          department,
          batch,
          currentSemester: parseInt(semester.replace(/\D/g, "") || "1"),
          section,
          imageUrl: finalImageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        },
      );

      Toast.show({
        type: "success",
        text1: "Welcome to UniCompanion!",
        text2: "Please log in with your new account.",
      });

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setImageUri(null);
      setImageBase64(null);
      setStudentId("");
      setDepartment("");
      setSemester("");
      setSection("");
      setBatch("");

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (error: any) {
      const backendError = error.response?.data?.error;
      const errorMessage = backendError || error.message;

      console.error("Registration Error Details:", errorMessage);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: errorMessage,
      });
    }
  };

  const renderInput = (
    label: string,
    iconName: any,
    placeholder: string,
    value: string,
    setValue: (val: string) => void,
    id: string,
    options?: any,
  ) => {
    const isFocused = focusedInput === id;
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
          <Feather
            name={iconName}
            size={20}
            color={colors.outline}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.outlineVariant}
            value={value}
            onChangeText={setValue}
            onFocus={() => setFocusedInput(id)}
            onBlur={() => setFocusedInput(null)}
            {...options}
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Navy Header Block */}
        <View style={styles.headerBlock}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.onPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Student Account</Text>
          <Text style={styles.subtitle}>
            Join your university network today.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Photo Upload Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handleImagePick}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Feather
                    name="camera"
                    size={32}
                    color={colors.primaryContainer}
                  />
                  <View style={styles.photoBadge}>
                    <Feather name="plus" size={12} color={colors.onPrimary} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Upload Profile Photo</Text>
          </View>

          {/* Core Fields */}
          {renderInput(
            "Full Name",
            "user",
            "Jane Doe",
            fullName,
            setFullName,
            "name",
          )}
          {renderInput(
            "University Email",
            "mail",
            "student@university.edu",
            email,
            setEmail,
            "email",
            { keyboardType: "email-address", autoCapitalize: "none" },
          )}
          {renderInput(
            "Student ID",
            "credit-card",
            "e.g. 12345678",
            studentId,
            setStudentId,
            "studentId",
          )}

          {/* Custom Department / Program Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Program / Department</Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                isDepartmentModalVisible && styles.inputFocused,
              ]}
              onPress={() => setDepartmentModalVisible(true)}
            >
              <Feather
                name="book"
                size={20}
                color={colors.outline}
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.selectorText,
                  !department && { color: colors.outlineVariant },
                ]}
                numberOfLines={1}
              >
                {department || "Select your program"}
              </Text>
              <Feather name="chevron-down" size={20} color={colors.outline} />
            </TouchableOpacity>
          </View>

          {/* Two-Column Layout for Semester & Section */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              {renderInput(
                "Semester",
                "calendar",
                "e.g. 5th",
                semester,
                setSemester,
                "semester",
              )}
            </View>
            <View style={styles.halfInput}>
              {renderInput(
                "Section",
                "users",
                "e.g. A",
                section,
                setSection,
                "section",
              )}
            </View>
          </View>

          {renderInput("Batch", "award", "e.g. 2024", batch, setBatch, "batch")}

          {/* Passwords */}
          {renderInput(
            "Password",
            "lock",
            "••••••••",
            password,
            setPassword,
            "pass",
            { secureTextEntry: true },
          )}
          {renderInput(
            "Confirm Password",
            "refresh-cw",
            "••••••••",
            confirmPassword,
            setConfirmPassword,
            "passConfirm",
            { secureTextEntry: true },
          )}

          {/* Info Text */}
          <View style={styles.infoRow}>
            <Feather name="info" size={16} color={colors.outline} />
            <Text style={styles.infoText}>
              Only verified university emails are permitted.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRegister}
          >
            <Text style={styles.submitButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Program Selection Modal */}
      <Modal
        visible={isDepartmentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDepartmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Program</Text>
              <TouchableOpacity
                onPress={() => setDepartmentModalVisible(false)}
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
                    setDepartment(item.name);
                    setDepartmentModalVisible(false);
                  }}
                >
                  <Text style={styles.programName}>{item.name}</Text>
                  <Text style={styles.programFaculty}>
                    {item.faculty} • {item.level}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.sectionBreak,
  },
  headerBlock: {
    backgroundColor: colors.primaryContainer,
    paddingTop: 60,
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: spacing.stackLg,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.onPrimary,
    marginBottom: spacing.stackSm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onPrimaryContainer,
  },
  formContainer: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sectionBreak,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surfaceContainerHighest,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: rounded.full,
  },
  photoPlaceholder: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  photoBadge: {
    position: "absolute",
    bottom: -5,
    right: -10,
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.full,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  photoLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.stackMd,
  },
  inputGroup: {
    marginBottom: spacing.stackLg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  inputLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.gutter,
    height: 56,
  },
  inputFocused: {
    borderColor: colors.primaryContainer,
  },
  inputIcon: {
    marginRight: spacing.stackMd,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },
  selectorText: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  infoText: {
    ...typography.labelSm,
    color: colors.outline,
    marginLeft: spacing.stackSm,
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.lg,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.stackLg,
  },
  submitButtonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "600",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  loginLink: {
    ...typography.bodyMd,
    color: colors.primaryContainer,
    fontWeight: "700",
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
