import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

export default function AdminCalendarUploadScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [calendarPayload, setCalendarPayload] = useState<any>(null);

  // --- Handlers ---

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      let jsonString = "";

      const response = await fetch(file.uri);
      jsonString = await response.text();

      const parsedData = JSON.parse(jsonString);

      if (
        !parsedData.title ||
        !parsedData.semester ||
        !Array.isArray(parsedData.events)
      ) {
        throw new Error(
          "Invalid Calendar Format. Missing title, semester, or events array.",
        );
      }

      // THE FIX: Automatically sanitize the targeting arrays to UPPERCASE
      if (Array.isArray(parsedData.targetFaculties)) {
        parsedData.targetFaculties = parsedData.targetFaculties.map(
          (f: string) => f.toUpperCase(),
        );
      }
      if (Array.isArray(parsedData.targetDepartments)) {
        parsedData.targetDepartments = parsedData.targetDepartments.map(
          (d: string) => d.toUpperCase(),
        );
      }

      setCalendarPayload(parsedData);
      Toast.show({ type: "success", text1: "File loaded successfully!" });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to read file",
        text2: error.message || "Please ensure you selected a valid JSON file.",
      });
      setCalendarPayload(null);
    }
  };

  const handlePublishCalendar = async () => {
    if (!calendarPayload) return;

    try {
      setIsLoading(true);

      // Post the parsed JSON directly to the backend
      await api.post("/calendars", calendarPayload);

      Toast.show({
        type: "success",
        text1: "Calendar Published!",
        text2: "Students and Teachers can now view this timeline.",
      });

      setCalendarPayload(null);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Publish Failed",
        text2:
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Academic Calendar</Text>
          <Text style={styles.headerSubtitle}>
            Upload and publish semester timelines
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DATA UPLOAD</Text>

          <TouchableOpacity style={styles.uploadBox} onPress={handlePickFile}>
            <View style={styles.iconCircle}>
              <Feather
                name="file-text"
                size={28}
                color={colors.primaryContainer}
              />
            </View>
            <Text style={styles.uploadTitle}>Select JSON File</Text>
            <Text style={styles.uploadSubtitle}>
              Upload the structured calendar data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Preview Section (Only shows if a valid JSON is loaded) */}
        {calendarPayload && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeader}>CALENDAR PREVIEW</Text>
              <TouchableOpacity onPress={() => setCalendarPayload(null)}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewBox}>
              <View style={styles.previewRow}>
                <Feather name="bookmark" size={16} color={colors.outline} />
                <Text style={styles.previewLabel}>Title:</Text>
                <Text style={styles.previewValue} numberOfLines={1}>
                  {calendarPayload.title}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Feather name="calendar" size={16} color={colors.outline} />
                <Text style={styles.previewLabel}>Semester:</Text>
                <Text style={styles.previewValue}>
                  {calendarPayload.semester}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Feather name="globe" size={16} color={colors.outline} />
                <Text style={styles.previewLabel}>Visibility:</Text>
                <Text style={styles.previewValue}>
                  {calendarPayload.isGlobal
                    ? "Global (All Students)"
                    : "Targeted Faculties"}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Feather name="list" size={16} color={colors.outline} />
                <Text style={styles.previewLabel}>Events:</Text>
                <Text style={styles.previewValue}>
                  {calendarPayload.events.length} events loaded
                </Text>
              </View>

              {/* Target Faculties Tags */}
              {!calendarPayload.isGlobal &&
                calendarPayload.targetFaculties?.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {calendarPayload.targetFaculties.map(
                      (fac: string, idx: number) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{fac}</Text>
                        </View>
                      ),
                    )}
                  </View>
                )}
            </View>

            {/* Publish Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handlePublishCalendar}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <Feather
                    name="upload-cloud"
                    size={20}
                    color={colors.onPrimary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>
                    Publish to Database
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
    marginBottom: spacing.stackLg,
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
  clearText: { ...typography.labelMd, color: colors.error, fontWeight: "600" },

  // Upload Box Styles
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.surfaceContainerHigh,
    borderStyle: "dashed",
    borderRadius: rounded.lg,
    padding: spacing.sectionBreak,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: rounded.full,
    backgroundColor: colors.secondaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  uploadTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  uploadSubtitle: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
  },

  // Preview Box Styles
  previewBox: {
    backgroundColor: "#F4F6F8",
    padding: spacing.stackLg,
    borderRadius: rounded.md,
    marginBottom: spacing.stackLg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackSm,
  },
  previewLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.stackSm,
    width: 80,
  },
  previewValue: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: spacing.stackMd,
    paddingTop: spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
  },
  tag: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: rounded.full,
  },
  tagText: { ...typography.labelSm, color: colors.onPrimary },

  submitButton: {
    flexDirection: "row",
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.lg,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "600",
  },
});
