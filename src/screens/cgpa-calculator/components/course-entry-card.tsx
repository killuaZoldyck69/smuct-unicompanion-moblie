import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, CourseEntry, GRADE_SCALE, fontFamily } from "../constants";
import { sanitizeCredit } from "../utils";

interface CourseEntryCardProps {
  course: CourseEntry;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: keyof CourseEntry, value: string) => void;
  onRemove: (id: string) => void;
  onOpenGradePicker: (id: string) => void;
}

const CREDIT_PRESETS = ["1.5", "3.0", "4.0"] as const;

export const CourseEntryCard = React.memo(function CourseEntryCard({
  course,
  index,
  canDelete,
  onUpdate,
  onRemove,
  onOpenGradePicker,
}: CourseEntryCardProps) {
  const selectedGradeObj = GRADE_SCALE.find((g) => g.grade === course.grade);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>COURSE {index + 1}</Text>
        </View>

        {canDelete && (
          <TouchableOpacity
            onPress={() => onRemove(course.id)}
            style={styles.deleteBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Remove course ${index + 1}`}
          >
            <Feather name="x" size={14} color="#be123c" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Course Title or Code</Text>
        <TextInput
          style={styles.textInputPill}
          placeholder="e.g. CSE2011 Data Structure"
          placeholderTextColor={BENTO_COLORS.subtleText}
          value={course.name}
          onChangeText={(val) => onUpdate(course.id, "name", val)}
          accessible={true}
          accessibilityLabel={`Course ${index + 1} title`}
        />
      </View>

      <View style={styles.dualInputsRow}>
        <View style={styles.creditInputCol}>
          <Text style={styles.inputLabel}>Credits</Text>
          <TextInput
            style={styles.creditInputPill}
            placeholder="3.0"
            placeholderTextColor={BENTO_COLORS.subtleText}
            keyboardType="decimal-pad"
            value={course.credit}
            onChangeText={(val) => onUpdate(course.id, "credit", sanitizeCredit(val))}
            accessible={true}
            accessibilityLabel={`Course ${index + 1} credits`}
          />

          <View style={styles.creditPresetsRow}>
            {CREDIT_PRESETS.map((preset) => {
              const isActive = course.credit === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => onUpdate(course.id, "credit", preset)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Set ${preset} credits`}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isActive && styles.presetChipTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.gradePickerCol}>
          <Text style={styles.inputLabel}>Expected Grade</Text>
          <TouchableOpacity
            style={[
              styles.gradePickerButton,
              selectedGradeObj && {
                backgroundColor: selectedGradeObj.color + "15",
                borderColor: selectedGradeObj.color + "40",
              },
            ]}
            onPress={() => onOpenGradePicker(course.id)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Select grade for course ${index + 1}, currently ${
              course.grade || "not selected"
            }`}
          >
            {selectedGradeObj ? (
              <View style={styles.selectedGradeContent}>
                <Text
                  style={[
                    styles.selectedGradeLetter,
                    { color: selectedGradeObj.color },
                  ]}
                >
                  {selectedGradeObj.grade}
                </Text>
                <Text style={styles.selectedGradePoint}>
                  ({selectedGradeObj.point.toFixed(2)} GP)
                </Text>
              </View>
            ) : (
              <Text style={styles.placeholderGradeText}>Select Grade...</Text>
            )}
            <Feather
              name="chevron-down"
              size={16}
              color={selectedGradeObj ? selectedGradeObj.color : BENTO_COLORS.subtleText}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  indexBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  indexText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.8,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginBottom: 6,
  },
  textInputPill: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.neutralText,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dualInputsRow: {
    flexDirection: "row",
    gap: 12,
  },
  creditInputCol: {
    flex: 1,
  },
  creditInputPill: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    textAlign: "center",
  },
  creditPresetsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  presetChip: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  presetChipActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  presetChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  presetChipTextActive: {
    color: "#ffffff",
  },
  gradePickerCol: {
    flex: 1.3,
  },
  gradePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedGradeContent: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  selectedGradeLetter: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
  },
  selectedGradePoint: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  placeholderGradeText: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
  },
});
