import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

// Standard Grade Point mapping (Adjust if your university uses a different scale)
const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 3.75,
  "A-": 3.5,
  "B+": 3.25,
  B: 3.0,
  "B-": 2.75,
  "C+": 2.5,
  C: 2.25,
  D: 2.0,
  F: 0.0,
};

interface CourseEntry {
  id: string;
  name: string;
  credit: string;
  grade: string;
}

export default function CGPACalculatorScreen() {
  const router = useRouter();

  const [courses, setCourses] = useState<CourseEntry[]>([
    { id: "1", name: "", credit: "", grade: "" },
  ]);

  // Fetch active hubs to power the Auto-Fill feature
  const { data: myHubs, isLoading } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => (await api.get("/hubs/my")).data?.data || [],
  });

  // --- Handlers ---
  const addCourseRow = () => {
    setCourses([
      ...courses,
      { id: Math.random().toString(), name: "", credit: "", grade: "" },
    ]);
  };

  const removeCourseRow = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (
    id: string,
    field: keyof CourseEntry,
    value: string,
  ) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleAutoFill = () => {
    if (!myHubs || myHubs.length === 0) {
      Toast.show({ type: "info", text1: "No active courses found." });
      return;
    }

    const activeHubs = myHubs.filter((m: any) => !m.hub.isArchived);
    const importedCourses = activeHubs.map((m: any) => ({
      id: Math.random().toString(),
      name: m.hub.courseName,
      credit: String(m.hub.credit),
      grade: "", // Leave empty for the user to select
    }));

    // Replace current rows with imported courses
    setCourses(importedCourses);
    Toast.show({ type: "success", text1: "Courses imported successfully!" });
  };

  const handleClearAll = () => {
    setCourses([
      { id: Math.random().toString(), name: "", credit: "", grade: "" },
    ]);
  };

  // --- Calculations ---
  const { totalCredits, cgpa } = useMemo(() => {
    let tCredits = 0;
    let tPoints = 0;

    courses.forEach((c) => {
      const creditNum = parseFloat(c.credit);
      const gradePoint = GRADE_POINTS[c.grade];

      if (!isNaN(creditNum) && gradePoint !== undefined) {
        tCredits += creditNum;
        tPoints += creditNum * gradePoint;
      }
    });

    const calculatedCGPA =
      tCredits > 0 ? (tPoints / tCredits).toFixed(2) : "0.00";

    return { totalCredits: tCredits, cgpa: calculatedCGPA };
  }, [courses]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>CGPA Calculator</Text>
            <Text style={styles.headerSubtitle}>
              Estimate your semester results
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* RESULT CARD */}
          <View style={styles.resultCard}>
            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>Total Credits</Text>
              <Text style={styles.resultValue}>{totalCredits}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>Estimated CGPA</Text>
              <Text style={[styles.resultValue, { color: colors.primary }]}>
                {cgpa}
              </Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.autoFillBtn]}
              onPress={handleAutoFill}
              disabled={isLoading}
            >
              <Feather
                name="download-cloud"
                size={16}
                color={colors.onPrimary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnTextWhite}>
                Auto-fill My Courses
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.clearBtn]}
              onPress={handleClearAll}
            >
              <Feather
                name="trash-2"
                size={16}
                color={colors.error}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnTextRed}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* COURSE LIST */}
          <View style={styles.courseList}>
            {courses.map((course, index) => (
              <View key={course.id} style={styles.courseRow}>
                {/* Delete Button (Only if more than 1 row) */}
                {courses.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeCourseRow(course.id)}
                  >
                    <Feather
                      name="minus-circle"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                )}

                <View style={styles.inputsContainer}>
                  {/* Course Name */}
                  <TextInput
                    style={styles.inputName}
                    placeholder={`Course ${index + 1} Name`}
                    placeholderTextColor={colors.outlineVariant}
                    value={course.name}
                    onChangeText={(val) => updateCourse(course.id, "name", val)}
                  />

                  <View style={styles.bottomInputs}>
                    {/* Credit Input */}
                    <View style={styles.creditBox}>
                      <Text style={styles.miniLabel}>Credits</Text>
                      <TextInput
                        style={styles.inputCredit}
                        placeholder="3.0"
                        placeholderTextColor={colors.outlineVariant}
                        keyboardType="numeric"
                        value={course.credit}
                        onChangeText={(val) =>
                          updateCourse(course.id, "credit", val)
                        }
                      />
                    </View>

                    {/* Grade Dropdown */}
                    <View style={styles.gradeBox}>
                      <Text style={styles.miniLabel}>Expected Grade</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={course.grade}
                          onValueChange={(val) =>
                            updateCourse(course.id, "grade", val)
                          }
                          style={styles.picker}
                        >
                          <Picker.Item
                            label="Select..."
                            value=""
                            color={colors.outline}
                          />
                          {Object.keys(GRADE_POINTS).map((grade) => (
                            <Picker.Item
                              key={grade}
                              label={grade}
                              value={grade}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addCourseBtn} onPress={addCourseRow}>
            <Feather
              name="plus"
              size={18}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addCourseText}>Add Another Course</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: 16 },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  scrollContent: { padding: spacing.marginMobile, paddingBottom: 100 },

  resultCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackLg,
    ...shadows.level1,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  resultCol: { flex: 1, alignItems: "center", justifyContent: "center" },
  resultDivider: {
    width: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginHorizontal: 16,
  },
  resultLabel: {
    ...typography.labelMd,
    color: colors.outline,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  resultValue: { fontSize: 36, fontWeight: "800", color: colors.onSurface },

  actionRow: {
    flexDirection: "row",
    gap: spacing.stackMd,
    marginBottom: spacing.stackLg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: rounded.md,
    borderWidth: 1,
  },
  autoFillBtn: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  clearBtn: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error + "30",
  },
  actionBtnTextWhite: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  actionBtnTextRed: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
  },

  courseList: { gap: spacing.stackMd },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackMd,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  removeBtn: { padding: 8, marginRight: 4 },

  inputsContainer: { flex: 1 },
  inputName: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    paddingBottom: 8,
    marginBottom: 8,
  },

  bottomInputs: { flexDirection: "row", gap: 12 },
  creditBox: { flex: 0.4 },
  gradeBox: { flex: 0.6 },
  miniLabel: {
    ...typography.labelSm,
    color: colors.outline,
    fontSize: 10,
    marginBottom: 4,
  },

  inputCredit: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: "center",
  },
  pickerWrapper: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.sm,
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  picker: { color: colors.onSurface },

  addCourseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: spacing.stackMd,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    borderRadius: rounded.lg,
  },
  addCourseText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
});
