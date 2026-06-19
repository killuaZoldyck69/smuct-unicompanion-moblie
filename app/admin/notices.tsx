import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

export default function AdminNoticeUploadScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    referenceNo: "",
    title: "",
    body: "",
    issuerName: "",
    issuerDesignation: "",
    copyTo: [] as string[],
  });

  const [ccInput, setCcInput] = useState("");

  // Publish Mutation
  const publishMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return await api.post("/notices", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      Toast.show({ type: "success", text1: "Notice Published Officially!" });
      router.back();
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Publish Failed",
        text2: err.message,
      });
    },
  });

  // --- Handlers ---
  const handleAddCc = () => {
    if (!ccInput.trim() || formData.copyTo.includes(ccInput.trim())) return;
    setFormData({ ...formData, copyTo: [...formData.copyTo, ccInput.trim()] });
    setCcInput("");
  };

  const handleRemoveCc = (itemToRemove: string) => {
    setFormData({
      ...formData,
      copyTo: formData.copyTo.filter((item) => item !== itemToRemove),
    });
  };

  const handlePublish = () => {
    if (
      !formData.title ||
      !formData.body ||
      !formData.issuerName ||
      !formData.issuerDesignation
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Required Fields",
        text2: "Title, Body, and Issuer details are required.",
      });
      return;
    }
    publishMutation.mutate(formData);
  };

  // --- Render Helpers ---
  const renderInput = (
    label: string,
    key: keyof typeof formData,
    placeholder: string,
    multiline = false,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}
      >
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={formData[key] as string}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={placeholder}
          placeholderTextColor={colors.outlineVariant}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Draft Official Notice</Text>
          <Text style={styles.headerSubtitle}>
            Publish to the digital noticeboard
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Meta Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DOCUMENT METADATA</Text>
          {renderInput(
            "Reference Number",
            "referenceNo",
            "e.g., No. SMUCT/REG./GEN...",
          )}
          {renderInput(
            "Notice Title",
            "title",
            "e.g., VACATION FOR EID-UL-ADHA 2026",
          )}
        </View>

        {/* Content Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>MAIN CONTENT</Text>
          {renderInput(
            "Body Text",
            "body",
            "Enter the main paragraphs here...",
            true,
          )}
        </View>

        {/* Signatory Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SIGNATORY DETAILS</Text>
          {renderInput(
            "Issuer Name",
            "issuerName",
            "e.g., Dr. Par Mosiur Rahman",
          )}
          {renderInput(
            "Issuer Designation",
            "issuerDesignation",
            "e.g., Registrar",
          )}
        </View>

        {/* CC Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>COPY TO (CC)</Text>
          <View style={styles.ccInputContainer}>
            <View
              style={[
                styles.inputWrapper,
                { flex: 1, marginRight: spacing.stackSm },
              ]}
            >
              <TextInput
                style={styles.input}
                value={ccInput}
                onChangeText={setCcInput}
                placeholder="e.g., All concerned"
                placeholderTextColor={colors.outlineVariant}
                onSubmitEditing={handleAddCc}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCc}>
              <Feather name="plus" size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>

          {formData.copyTo.length > 0 && (
            <View style={styles.ccList}>
              {formData.copyTo.map((item, index) => (
                <View key={index} style={styles.ccChip}>
                  <Text style={styles.ccChipText}>
                    {index + 1}. {item}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveCc(item)}
                    style={{ marginLeft: 8 }}
                  >
                    <Feather name="x" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            publishMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handlePublish}
          disabled={publishMutation.isPending}
        >
          {publishMutation.isPending ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Feather
                name="send"
                size={20}
                color={colors.onPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.submitButtonText}>Publish Notice</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    padding: spacing.stackLg,
    marginBottom: spacing.stackLg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeader: {
    ...typography.labelSm,
    color: colors.outline,
    letterSpacing: 1.5,
    marginBottom: spacing.stackLg,
  },

  inputGroup: { marginBottom: spacing.stackMd },
  inputLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    height: 48,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.stackSm,
  },
  inputWrapperMultiline: {
    height: 160,
    alignItems: "flex-start",
    paddingVertical: spacing.stackSm,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },
  inputMultiline: { height: "100%" },

  ccInputContainer: { flexDirection: "row", alignItems: "center" },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.md,
    justifyContent: "center",
    alignItems: "center",
  },
  ccList: { marginTop: spacing.stackMd, gap: spacing.stackSm },
  ccChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: rounded.md,
  },
  ccChipText: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },

  submitButton: {
    flexDirection: "row",
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
});
