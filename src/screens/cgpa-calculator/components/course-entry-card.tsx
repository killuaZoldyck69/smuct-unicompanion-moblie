import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, CourseEntry, fontFamily } from "../constants";

interface CourseEntryCardProps {
  course: CourseEntry;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: keyof CourseEntry, value: string) => void;
  onRemove: (id: string) => void;
  onOpenGradePicker: (id: string) => void;
}

export const CourseEntryCard = React.memo(function CourseEntryCard({
  course,
  index,
  canDelete,
  onUpdate,
  onRemove,
  onOpenGradePicker,
}: CourseEntryCardProps) {
  // Stepper increment / decrement
  const handleDecrement = () => {
    const current = parseFloat(course.credit) || 3;
    const nextVal = Math.max(1, current - 0.5);
    onUpdate(
      course.id,
      "credit",
      nextVal % 1 === 0 ? nextVal.toFixed(0) : nextVal.toFixed(1)
    );
  };

  const handleIncrement = () => {
    const current = parseFloat(course.credit) || 3;
    const nextVal = Math.min(6, current + 0.5);
    onUpdate(
      course.id,
      "credit",
      nextVal % 1 === 0 ? nextVal.toFixed(0) : nextVal.toFixed(1)
    );
  };

  const displayCredit = () => {
    const val = parseFloat(course.credit);
    if (isNaN(val)) return "3";
    return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
  };

  // Resolve actual code and title from course data
  const currentCode =
    course.code !== undefined
      ? course.code
      : course.name
        ? course.name.split("-")[0]?.trim() || ""
        : "";

  const currentTitle =
    course.title !== undefined
      ? course.title
      : course.name && course.name.includes("-")
        ? course.name.split("-").slice(1).join("-").trim()
        : course.name || "";

  return (
    <View style={styles.card}>
      {/* Top Row: Number Badge + Code/Title Inputs + Delete Button */}
      <View style={styles.topRow}>
        <View style={styles.indexCircle}>
          <Text style={styles.indexNumber}>{index + 1}</Text>
        </View>

        <View style={styles.titleCol}>
          <TextInput
            style={styles.codeText}
            value={currentCode}
            placeholder="Course Code (e.g. CSE2011)"
            placeholderTextColor={BENTO_COLORS.mutedText}
            onChangeText={(val) => onUpdate(course.id, "code", val)}
            accessible={true}
            accessibilityLabel={`Course ${index + 1} code`}
          />
          <TextInput
            style={styles.nameText}
            value={currentTitle}
            placeholder="Course Title (e.g. Data Structure)"
            placeholderTextColor={BENTO_COLORS.mutedText}
            onChangeText={(val) => onUpdate(course.id, "title", val)}
            accessible={true}
            accessibilityLabel={`Course ${index + 1} name`}
          />
        </View>

        {canDelete && (
          <TouchableOpacity
            onPress={() => onRemove(course.id)}
            style={styles.deleteCircle}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Remove course ${index + 1}`}
          >
            <Feather name="trash-2" size={15} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Row: Left Credits Stepper + Right Expected Grade Dropdown */}
      <View style={styles.controlsRow}>
        {/* Credits Stepper Column */}
        <View style={styles.controlCol}>
          <Text style={styles.controlLabel}>Credits</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              onPress={handleDecrement}
              style={styles.stepperBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Decrease course credit"
            >
              <Feather name="minus" size={15} color="#0f172a" />
            </TouchableOpacity>

            <Text style={styles.stepperValue}>{displayCredit()}</Text>

            <TouchableOpacity
              onPress={handleIncrement}
              style={styles.stepperBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Increase course credit"
            >
              <Feather name="plus" size={15} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expected Grade Dropdown Column */}
        <View style={styles.controlCol}>
          <Text style={styles.controlLabel}>Expected Grade</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => onOpenGradePicker(course.id)}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Select expected grade for course ${index + 1}. Current: ${
              course.grade || "None selected"
            }`}
          >
            <Text
              style={[
                styles.dropdownText,
                !course.grade && styles.dropdownPlaceholder,
              ]}
            >
              {course.grade || "Select"}
            </Text>
            <Feather name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.borderColor,
    ...BENTO_COLORS.shadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  indexCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  indexNumber: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.primaryBlue,
  },
  titleCol: {
    flex: 1,
    justifyContent: "center",
  },
  codeText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    padding: 0,
    margin: 0,
  },
  nameText: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    padding: 0,
    margin: 0,
    marginTop: 2,
  },
  deleteCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  controlCol: {
    flex: 1,
  },
  controlLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    marginBottom: 6,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 6,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  dropdownBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 14,
  },
  dropdownText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  dropdownPlaceholder: {
    color: BENTO_COLORS.mutedText,
    fontWeight: "500",
  },
});
