import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

// 1. Import your university data
import { universityPrograms } from "../../src/data/programs";

// 2. Dynamically extract unique Faculties
const FACULTIES = Array.from(new Set(universityPrograms.map((p) => p.faculty)));

// 3. Helper to extract clean Department names from Degree names
const cleanDepartmentName = (name: string) => {
  return (
    name
      // Notice that Bachelor, Master, and Masters are now at the front of the list!
      .replace(
        /^(Bachelor|Masters|Master|B\.Sc|BSS|BA|MA|MSS|MBA)\s*(\(Hons\))?\s*(of|in)?\s*/i,
        "",
      )
      .replace(/\s*\(.*\)\s*$/, "") // Removes trailing abbreviations like (BBA), (LLM)
      .trim()
  );
};

// 4. Helper to get departments (filtered by faculty if selected)
const getDepartments = (selectedFaculty: string) => {
  let programs = universityPrograms;
  if (selectedFaculty) {
    programs = programs.filter((p) => p.faculty === selectedFaculty);
  }
  const deps = programs.map((p) => cleanDepartmentName(p.name));
  return Array.from(new Set(deps)).sort(); // Remove duplicates and sort alphabetically
};

// Static Designations
const DESIGNATIONS = [
  "Lecturer",
  "Senior Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Adjunct Faculty",
];

export default function AddTeacherScreen() {
  const router = useRouter();

  // --- Form State ---
  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    email: "",
    password: "",
    designation: "",
    department: "",
    faculty: "",
  });

  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modal state management
  const [activeSelector, setActiveSelector] = useState<
    "designation" | "department" | "faculty" | null
  >(null);

  // --- Handlers ---
  const handleCreateTeacher = async () => {
    if (
      !formData.teacherId ||
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.designation ||
      !formData.department ||
      !formData.faculty
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill out all required fields.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    if (formData.password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 8 characters long.",
      });
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/teachers/register", formData);
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Teacher registered successfully.",
      });

      setFormData({
        teacherId: "",
        name: "",
        email: "",
        password: "",
        designation: "",
        department: "",
        faculty: "",
      });

      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      const status = error.response?.status;
      const backendMessage =
        error.response?.data?.message || error.response?.data?.error;

      if (status === 409) {
        Toast.show({
          type: "error",
          text1: "Duplicate Record",
          text2:
            backendMessage || "This Email or Teacher ID is already registered.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2:
            backendMessage || error.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderInput = (
    label: string,
    field: keyof typeof formData,
    icon: any,
    options?: any,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather
          name={icon}
          size={20}
          color={colors.outline}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={formData[field]}
          onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          placeholderTextColor={colors.outlineVariant}
          {...options}
        />
        {field === "password" && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: 4 }}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color={colors.outline}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSelector = (
    label: string,
    field: "designation" | "department" | "faculty",
    icon: any,
    placeholder: string,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          activeSelector === field && { borderColor: colors.primaryContainer },
        ]}
        onPress={() => setActiveSelector(field)}
      >
        <Feather
          name={icon}
          size={20}
          color={colors.outline}
          style={styles.inputIcon}
        />
        <Text
          style={[
            styles.input,
            { paddingTop: 16 },
            !formData[field] && { color: colors.outlineVariant },
          ]}
          numberOfLines={1}
        >
          {formData[field] || placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.outline} />
      </TouchableOpacity>
    </View>
  );

  // --- Modal Data Routing ---
  const getModalData = () => {
    switch (activeSelector) {
      case "faculty":
        return FACULTIES;
      case "department":
        return getDepartments(formData.faculty); // Filter by selected faculty!
      case "designation":
        return DESIGNATIONS;
      default:
        return [];
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Onboard Faculty</Text>
          <Text style={styles.headerSubtitle}>
            Register a new teacher into the system
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {renderInput("Teacher ID", "teacherId", "hash", {
            placeholder: "e.g. T-2024001",
          })}
          {renderInput("Full Name", "name", "user", {
            placeholder: "e.g. Dr. John Doe",
          })}
          {renderInput("Institutional Email", "email", "mail", {
            placeholder: "teacher@smuct.edu",
            keyboardType: "email-address",
            autoCapitalize: "none",
          })}
          {renderInput("Temporary Password", "password", "lock", {
            placeholder: "Minimum 8 characters",
            secureTextEntry: !showPassword,
            autoCapitalize: "none",
          })}

          <View style={styles.divider} />

          {renderSelector("Faculty", "faculty", "layers", "Select Faculty")}
          {renderSelector(
            "Department",
            "department",
            "book",
            formData.faculty ? "Select Department" : "Select Faculty First",
          )}
          {renderSelector(
            "Designation",
            "designation",
            "award",
            "Select Designation",
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleCreateTeacher}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? "Registering..." : "Complete Registration"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Dynamic Reusable Modal --- */}
      <Modal
        visible={activeSelector !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select{" "}
                {activeSelector
                  ? activeSelector.charAt(0).toUpperCase() +
                    activeSelector.slice(1)
                  : ""}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveSelector(null)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getModalData()}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    if (activeSelector) {
                      // If changing Faculty, reset the Department to avoid mismatch errors
                      if (
                        activeSelector === "faculty" &&
                        formData.faculty !== item
                      ) {
                        setFormData({
                          ...formData,
                          faculty: item,
                          department: "",
                        });
                      } else {
                        setFormData({ ...formData, [activeSelector]: item });
                      }
                    }
                    setActiveSelector(null);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {activeSelector && formData[activeSelector] === item && (
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },
  scrollContent: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.marginMobile,
    ...shadows.level1,
  },
  inputGroup: { marginBottom: spacing.stackLg },
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
  inputIcon: { marginRight: spacing.stackMd },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHigh,
    marginVertical: spacing.stackMd,
    marginBottom: spacing.stackLg,
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.lg,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.stackSm,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "600",
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
    height: "60%",
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
