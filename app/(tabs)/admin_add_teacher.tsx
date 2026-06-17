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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

export default function AddTeacherScreen() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
    department: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTeacher = async () => {
    // 1. Basic Frontend Validation (matches your Zod schema requirements)
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.designation ||
      !formData.department
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill all required fields.",
      });
      return;
    }

    if (formData.password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 8 characters.",
      });
      return;
    }

    try {
      setIsLoading(true);

      // 2. Hit your newly created backend route
      await api.post("/teachers/register", formData);

      Toast.show({ type: "success", text1: "Teacher Account Created!" });

      // 3. Clear the form on success
      setFormData({
        name: "",
        email: "",
        password: "",
        designation: "",
        department: "",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Faculty</Text>
        <Text style={styles.headerSubtitle}>Create a new teacher account</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {renderInput("Full Name", "name", "user", {
            placeholder: "e.g. Dr. John Doe",
          })}

          {renderInput("Institutional Email", "email", "mail", {
            placeholder: "teacher@smuct.edu",
            keyboardType: "email-address",
            autoCapitalize: "none",
          })}

          {renderInput("Temporary Password", "password", "lock", {
            placeholder: "Assign an initial password (min 8 chars)",
            secureTextEntry: false, // Intentionally false so the Admin can see what they are typing and share it
          })}

          <View style={styles.divider} />

          {renderInput("Designation", "designation", "award", {
            placeholder: "e.g. Assistant Professor",
          })}
          {renderInput("Department", "department", "book", {
            placeholder: "e.g. CSE",
          })}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleCreateTeacher}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? "Creating Teacher..." : "Create Teacher Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "600",
  },
});
